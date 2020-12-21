import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { getSession, Session } from 'next-auth/client';
import { Component } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState } from 'draft-js';
import axios from 'axios';
import AdminContainer from '../../../../components/adminContainer';
import { Post } from '../../../../models';
import { dbConnection } from '../../../../repository';
import Line from '../../../../components/editorComponents/line';
import WysiwygImage from '../../../../components/editorComponents/image';
import { convertToHTML, convertFromHTML } from 'draft-convert';
import { CUSTOM_FIGURE, HORIZONTAL_LINE } from '../../../../constants/editorEntityType';
import SpinnerButton from '../../../../components/spinnerButton';
import moment from 'moment';
import Head from 'next/head';

const Editor: any = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor as any),
  { ssr: false });

interface IEditPostProps {
  post: Post | null;
  postId: string;
  publicationId: string;
  session: Session | null;
}

interface IEditPostState {
  isSaving: boolean;
  savedSuccess: boolean;
  savedFail: boolean;
  isPublishing: boolean;
  publishFail: boolean;
  showPublishConfirmation: boolean;
  title: string;
  subTitle: string;
  editorState: EditorState;
}

export default class EditPost extends Component<IEditPostProps, IEditPostState> {

  timeout: any = null;

  convertContentToHtml = convertToHTML({
    blockToHTML: (block) => {
      if ((block as any).type === 'code') {
        return <pre />
      }
    },
    entityToHTML: (entity) => {
      if (entity.type === HORIZONTAL_LINE) {
        return <hr />
      }
      if (entity.type === CUSTOM_FIGURE) {
        return <img src={entity.data.imageUrl} alt={entity.data.imageCaption} style={{ width: '100%' }} />
      }
    }
  });

  convertContentFromHtml = convertFromHTML({
    htmlToBlock: (nodeName, node): any => {
      if (nodeName === 'hr') {
        return {
          type: 'atomic',
          data: {}
        }
      }
      if (nodeName === 'figure') {
        return {
          type: 'atomic',
          data: {}
        }
      }
    },
    htmlToEntity: (nodeName, node, createEntity) => {
      if (nodeName === 'hr') {
        return createEntity(HORIZONTAL_LINE, 'IMMUTABLE', {});
      }
      if (nodeName === 'figure') {
        const imageUrl = (node.children.item(0) as HTMLImageElement)?.src;
        const imageCaption = (node.children.item(0) as HTMLImageElement)?.alt;
        return createEntity(CUSTOM_FIGURE, 'IMMUTABLE', {
          imageUrl,
          imageCaption,
        });
      }
    }
  });

  constructor(props: IEditPostProps) {
    super(props);
    this.savePost = this.savePost.bind(this);
    this.publishPost = this.publishPost.bind(this);
    this.savePostWithTimeout = this.savePostWithTimeout.bind(this);
    this.savePostWithKeyBinding = this.savePostWithKeyBinding.bind(this);
    this.blockRenderer = this.blockRenderer.bind(this);
    this.getSaveButtonText = this.getSaveButtonText.bind(this);
    this.state = {
      isSaving: false,
      savedSuccess: false,
      savedFail: false,
      isPublishing: false,
      publishFail: false,
      showPublishConfirmation: false,
      title: props.post ? props.post.title : '',
      subTitle: props.post ? props.post.subtitle : '',
      editorState: EditorState.createEmpty()
    }
  }

  componentDidMount() {
    const post = this.props.post ? this.props.post : { htmlContent: '' };
    if (post.htmlContent) {
      const contentState = this.convertContentFromHtml(post.htmlContent)
      this.setState({ editorState: EditorState.createWithContent(contentState) });
    }

    document.addEventListener('keydown', this.savePostWithKeyBinding);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.savePostWithKeyBinding);
  }

  savePostWithKeyBinding = (evt: KeyboardEvent) => {
    if (
      (evt.ctrlKey && evt.key === "s") ||
      (evt.ctrlKey && evt.key === "S") ||
      (evt.metaKey && evt.key === "s") ||
      (evt.metaKey && evt.key === "S")
    ) {
      evt.preventDefault();
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.savePost();
    }
  }

  savePost = () => {
    this.setState({
      isSaving: true,
      savedSuccess: false,
      savedFail: false
    });
    axios.post(`/api/publication/post?publicationId=${this.props.publicationId}&postId=${this.props.postId}`, {
      title: this.state.title,
      subTitle: this.state.subTitle,
      htmlContent: this.convertContentToHtml(this.state.editorState.getCurrentContent()),
    })
      .then(() => {
        this.setState({
          isSaving: false,
          savedFail: false,
          savedSuccess: true
        });
      })
      .catch(() => {
        this.setState({
          isSaving: false,
          savedFail: true,
          savedSuccess: false
        });
      });
  }

  publishPost = () => {
    this.setState({
      isPublishing: true,
      publishFail: false
    });
    axios.post(`/api/publication/publish-post?publicationId=${this.props.publicationId}&postId=${this.props.postId}`, {
      title: this.state.title,
      subTitle: this.state.subTitle,
      htmlContent: this.convertContentToHtml(this.state.editorState.getCurrentContent()),
    }, { withCredentials: true })
      .then(response => {
        if (response.data) {
          window.location.href = response.data.canonicalUrl;
        }
      })
      .catch(() => {
        this.setState({
          isPublishing: false,
          publishFail: false
        });
      });
  }

  savePostWithTimeout = () => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.savePost(), 1500);
  }

  getSaveButtonText = (): string => {
    if (this.state.savedSuccess) {
      return `Last save ${moment(new Date()).format('LT').toLowerCase()}`;
    }

    if (this.state.savedFail) {
      return 'Saving failed';
    }

    if (!this.state.isSaving && !this.state.savedSuccess && !this.state.savedFail) {
      return 'Save';
    }

    return 'Saving...';
  }

  blockRenderer = (block: any) => {
    const { editorState } = this.state;
    if (block.getType() === 'atomic') {
      const contentState = editorState.getCurrentContent();
      const entityKey = block.getEntityAt(0);
      const entity = contentState.getEntity(entityKey);
      if (entity && entity.getType() === HORIZONTAL_LINE) {
        return {
          component: () => <hr />,
          editable: false,
        };
      }
      if (entity && entity.getType() === CUSTOM_FIGURE) {
        return {
          component: () => <img src={entity.getData().imageUrl} alt={entity.getData().imageCaption} style={{ width: '100%' }} />,
          editable: false,
        };
      }
    }

    return undefined;
  }

  render() {
    return (
      <AdminContainer>
        <Head>
          <title>Edit post</title>
        </Head>
        {
          this.props.session &&
          <div className='flex flex-col justify-center items-center h-full'>
            <div className='adjusted-width bg-white px-4 flex-1 h-full flex flex-col justify-between mt-4'>
              <div>
                <h1 className='max-w-full'>
                  <input type='text' className='w-full' placeholder='Title' value={this.state.title} onChange={(evt) => this.setState({ title: evt.currentTarget.value })}
                    onKeyUp={this.savePostWithTimeout} />
                </h1>
                <h3>
                  <input type='text' className='w-full' placeholder='Subtitle' value={this.state.subTitle} onChange={(evt) => this.setState({ subTitle: evt.currentTarget.value })}
                    onKeyUp={this.savePostWithTimeout} />
                </h3>
                <hr className='mb-0' />
              </div>
              <div className='mb-4 flex-1'>
                <Editor
                  toolbar={{
                    options: ['inline', 'blockType', 'list', 'link', 'emoji'],
                    inline: {
                      options: ['bold', 'italic', 'underline'],
                      bold: { icon: require('../../../../public/assets/icons/format_bold.svg') },
                      italic: { icon: require('../../../../public/assets/icons/format_italic.svg') },
                      underline: { icon: require('../../../../public/assets/icons/format_underlined.svg') },
                    },
                    blockType: {
                      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
                    },
                    list: {
                      options: ['unordered', 'ordered', 'indent', 'outdent'],
                      unordered: { icon: require('../../../../public/assets/icons/format_list_bulleted.svg') },
                      ordered: { icon: require('../../../../public/assets/icons/format_list_numbered.svg') },
                      indent: { icon: require('../../../../public/assets/icons/format_indent_increase.svg') },
                      outdent: { icon: require('../../../../public/assets/icons/format_indent_decrease.svg') },
                    },
                    link: {
                      showOpenOptionOnHover: false,
                      defaultTargetOption: '_blank',
                      options: ['link', 'unlink'],
                      link: { icon: require('../../../../public/assets/icons/insert_link.svg') },
                      unlink: { icon: require('../../../../public/assets/icons/link_off.svg') },
                    },
                    emoji: { icon: require('../../../../public/assets/icons/tag_faces.svg') },
                  }}
                  toolbarCustomButtons={[<WysiwygImage />, <Line />]}
                  blockRendererFn={this.blockRenderer}
                  editorState={this.state.editorState}
                  toolbarClassName='default-toolbar'
                  onEditorStateChange={(contentState: any) => {
                    this.setState({ editorState: contentState, savedSuccess: false }, () => this.savePostWithTimeout());
                  }}
                />
              </div>

              <div className='mt-4 pb-2 bottom-0 sticky z-20 bg-white flex flex-col'>
                <hr className='mt-0 mb-2' />
                <div className='flex justify-between'>

                  <SpinnerButton
                    onClick={this.savePost}
                    loading={this.state.isSaving}
                    disabled={this.state.savedSuccess || this.state.isSaving}
                    type='button'
                    text={this.getSaveButtonText()} />

                  {
                    this.props.post && !this.props.post.isPublished &&
                    <>
                      {
                        !this.state.showPublishConfirmation &&
                        <SpinnerButton
                          loading={false}
                          disabled={false}
                          type='button'
                          text='Publish'
                          onClick={(evt) => {
                            clearTimeout(this.timeout);
                            this.setState({ showPublishConfirmation: true });
                          }} />
                      }
                      {
                        this.state.showPublishConfirmation &&
                        <>
                          <div className='flex'>
                            <button className='bg-green-700 text-white px-4 py-2 rounded-l-lg hover:bg-green-500'
                              onClick={this.publishPost}>
                              {
                                this.state.isPublishing &&
                                <svg className="animate-spin h-5 w-5 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
                              }
                              {
                                !this.state.isPublishing &&
                                <span>Send email</span>
                              }
                            </button>
                            <button className='bg-red-700 text-white px-4 py-2 rounded-r-lg hover:bg-red-500' disabled={this.state.isPublishing}
                              onClick={() => this.setState({ showPublishConfirmation: false })}>Cancel</button>
                          </div>
                        </>
                      }
                    </>
                  }
                  {
                    this.props.post && this.props.post.isPublished &&
                    <span className='flex justify-center items-center'>Post successfully published</span>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </AdminContainer>
    )
  }

}

export const getServerSideProps: GetServerSideProps = async (context: any): Promise<any> => {
  const { publicationId, postId } = context.params;
  const session = await getSession(context);
  if (!session) {
    return {
      props: {}
    };
  }

  const connection = await dbConnection('post');
  const postRepository = connection.getRepository(Post);
  const post = await postRepository.findOne({ id: postId, publicationId: publicationId });
  await connection.close();

  return {
    props: {
      session,
      postId,
      publicationId,
      post: JSON.parse(JSON.stringify(post))
    }
  };
}
