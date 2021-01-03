import {
  ContentState,
  convertFromHTML,
  convertFromRaw,
  convertToRaw,
  EditorState,
} from "draft-js";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { Component } from "react";
import { Post } from "../../../models";
import { dbConnection } from "../../../repository";
import axios from 'axios';
import moment from 'moment';
import AdminPageContainer from "../../../components/adminContainer";
import Head from "next/head";
import SpinnerButton from "../../../components/spinnerButton";
import 'draft-js/dist/Draft.css';
import 'draftail/dist/draftail.css';
import { DraftailEditor, INLINE_STYLE, BLOCK_TYPE, ENTITY_TYPE } from 'draftail';
import { convertToHTML } from "draft-convert";
import ImageSource from "../../../components/draftailEntities/imageSource";
import ImageBlock from "../../../components/draftailEntities/imageBlock";
import LinkSource from "../../../components/draftailEntities/linkSource";
import { Router, withRouter } from "next/router";

interface IEditPostProps {
  post: Post | null;
  postId: string;
  router: Router;
}

interface IEditPostState {
  isSaving: boolean;
  savedSuccess: boolean;
  savedFail: boolean;
  savingBeforePublishing: boolean;
  title: string;
  subTitle: string;
  editorState: EditorState;
}

const exporterConfig = {
  blockToHTML: (block: any) => {
    if (block.type === BLOCK_TYPE.BLOCKQUOTE) {
      return <blockquote />
    }

    if (block.type === BLOCK_TYPE.CODE) {
      return <code />
    }

    // Discard atomic blocks, as they get converted based on their entity.
    if (block.type === BLOCK_TYPE.ATOMIC) {
      return {
        start: "",
        end: "",
      }
    }

    return null
  },

  entityToHTML: (entity: any, originalText: string) => {
    if (entity.type === ENTITY_TYPE.LINK) {
      return <a href={entity.data.href}>{originalText}</a>
    }

    if (entity.type === ENTITY_TYPE.IMAGE) {
      return <img src={entity.data.src} alt={entity.data.alt} style={{ width: '100%' }} />
    }

    if (entity.type === ENTITY_TYPE.HORIZONTAL_RULE) {
      return <hr />
    }

    return originalText
  },
}

class EditPost extends Component<IEditPostProps, IEditPostState> {

  timeout: any = null;

  constructor(props: IEditPostProps) {
    super(props);
    this.savePost = this.savePost.bind(this);
    this.savePostWithTimeout = this.savePostWithTimeout.bind(this);
    this.savePostWithKeyBinding = this.savePostWithKeyBinding.bind(this);
    this.getSaveButtonText = this.getSaveButtonText.bind(this);
    this.state = {
      isSaving: false,
      savedSuccess: false,
      savedFail: false,
      savingBeforePublishing: false,
      title: props.post ? props.post.title : '',
      subTitle: props.post ? props.post.subtitle : '',
      editorState: EditorState.createEmpty(),
    }
  }

  componentDidMount() {
    const post = this.props.post ? this.props.post : { htmlContent: '', rawContent: '', };
    if (post.rawContent) {
      const contentState = convertFromRaw(JSON.parse(post.rawContent));
      this.setState({ editorState: EditorState.createWithContent(contentState) });
    } else if (!post.rawContent && post.htmlContent) {
      const blocksFromHTML = convertFromHTML(post.htmlContent)
      const contentState = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
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

    const rawContent = convertToRaw(this.state.editorState.getCurrentContent());
    const htmlContent = convertToHTML(exporterConfig)(this.state.editorState.getCurrentContent());
    axios.post(`/api/publication/post?postId=${this.props.postId}`, {
      title: this.state.title,
      subTitle: this.state.subTitle,
      rawContent: JSON.stringify(rawContent),
      htmlContent: htmlContent,
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

  render() {
    return (
      <AdminPageContainer>
        <Head>
          <title>Edit post</title>
        </Head>
        <div className='flex flex-col justify-center items-center h-full'>
          <div className='adjusted-width bg-white px-4 flex-1 h-full flex flex-col justify-between mt-4'>
            <div>
              <h1 className='max-w-full'>
                <input type='text' className='w-full' placeholder='Title' value={this.state.title}
                  onChange={(evt) => this.setState({ title: evt.currentTarget.value })}
                  onKeyUp={this.savePostWithTimeout} />
              </h1>
              <h3>
                <input type='text' className='w-full' placeholder='Subtitle' value={this.state.subTitle}
                  onChange={(evt) => this.setState({ subTitle: evt.currentTarget.value })}
                  onKeyUp={this.savePostWithTimeout} />
              </h3>
              <hr className='mb-0' />
            </div>

            <div className='mb-4 flex-1'>
              <DraftailEditor
                placeholder='Write something...'
                editorState={this.state.editorState}
                enableHorizontalRule={
                  {
                    icon: <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" fillRule="evenodd" height="24" width="24" /><g><rect fill-rule="evenodd" height="2" width="16" x="4" y="11" /></g></g></svg>,
                  }
                }
                stripPastedStyles={false}
                spellCheck={true}
                blockTypes={[
                  {
                    type: BLOCK_TYPE.UNSTYLED,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4h-2v6H9V4h4m0 6a2 2 0 0 0 2-2a2 2 0 0 0-2-2h-2v4h2z" fill="#000000" /></svg>,
                  },
                  {
                    type: BLOCK_TYPE.HEADER_ONE,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m11 14v-2h2V6.31l-2.5 1.44V5.44L16 4h2v12h2v2h-6z" fill="#000000" /></svg>,
                  },
                  {
                    type: BLOCK_TYPE.HEADER_TWO,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m18 14h-6a2 2 0 0 1-2-2c0-.53.2-1 .54-1.36l4.87-5.23c.37-.36.59-.86.59-1.41a2 2 0 0 0-2-2a2 2 0 0 0-2 2h-2a4 4 0 0 1 4-4a4 4 0 0 1 4 4c0 1.1-.45 2.1-1.17 2.83L15 16h6v2z" fill="#000000" /></svg>,
                  },
                  {
                    type: BLOCK_TYPE.HEADER_THREE,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m12 0h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1h2v1h4v-4h-4v-2h4V6h-4v1h-2V6a2 2 0 0 1 2-2z" fill="#000000" /></svg>,
                  },
                  {
                    type: BLOCK_TYPE.HEADER_FOUR,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m15 14v-5h-5v-2l5-7h2v7h1v2h-1v5h-2m0-7V7.42L15.45 11H18z" fill="#000000" /></svg>,
                  },
                  {
                    type: BLOCK_TYPE.HEADER_FIVE,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m12 0h5v2h-5v4h2a4 4 0 0 1 4 4a4 4 0 0 1-4 4h-2a2 2 0 0 1-2-2v-1h2v1h2a2 2 0 0 0 2-2a2 2 0 0 0-2-2h-2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#000000" /></svg>,
                  },
                  {
                    type: BLOCK_TYPE.HEADER_SIX,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m12 0h4a2 2 0 0 1 2 2v1h-2V6h-4v4h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m0 8v4h4v-4h-4z" fill="#000000" /></svg>,
                  },
                  {
                    type: BLOCK_TYPE.UNORDERED_LIST_ITEM,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>,
                  },
                  {
                    type: BLOCK_TYPE.ORDERED_LIST_ITEM,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" /></svg>,
                  },
                  {
                    type: BLOCK_TYPE.BLOCKQUOTE,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M18.62 18h-5.24l2-4H13V6h8v7.24L18.62 18zm-2-2h.76L19 12.76V8h-4v4h3.62l-2 4zm-8 2H3.38l2-4H3V6h8v7.24L8.62 18zm-2-2h.76L9 12.76V8H5v4h3.62l-2 4z" /></svg>,
                  },
                  {
                    type: BLOCK_TYPE.CODE,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" /></svg>,
                  },
                ]}
                inlineStyles={[
                  {
                    type: INLINE_STYLE.BOLD,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>,
                  },
                  {
                    type: INLINE_STYLE.ITALIC,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" /></svg>,
                  },
                  {
                    type: INLINE_STYLE.UNDERLINE,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" /></svg>,
                  },
                ]}
                entityTypes={[
                  {
                    type: ENTITY_TYPE.LINK,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>,
                    description: 'Insert link',
                    attributes: ['href'],
                    whitelist: {
                      href: "^(?![#/])",
                    },
                    source: LinkSource,
                  },
                  {
                    type: ENTITY_TYPE.IMAGE,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" /></svg>,
                    description: 'Insert image',
                    attributes: ['src', 'alt'],
                    whitelist: {
                      src: '^(?!(data:|file:))',
                    },
                    source: ImageSource,
                    block: ImageBlock,
                  },
                ]}
                onChange={(state: any) => {
                  this.setState({ editorState: state, savedSuccess: false, }, () => this.savePostWithTimeout());
                }} />
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
                  <SpinnerButton
                    loading={this.state.savingBeforePublishing}
                    disabled={this.state.savingBeforePublishing}
                    type='button'
                    text='Publish'
                    onClick={(evt) => {
                      clearTimeout(this.timeout);
                      const rawContent = convertToRaw(this.state.editorState.getCurrentContent());
                      const htmlContent = convertToHTML(exporterConfig)(this.state.editorState.getCurrentContent());
                      this.setState({ savingBeforePublishing: true });
                      axios.post(`/api/publication/post?postId=${this.props.postId}`, {
                        title: this.state.title,
                        subTitle: this.state.subTitle,
                        rawContent: JSON.stringify(rawContent),
                        htmlContent: htmlContent,
                      })
                        .then(() => {
                          this.props.router.push(`/post/${this.props.postId}/publish`);
                        })
                        .catch(() => {
                          // TODO: Handle error - add toast message
                        });
                    }} />
                }
                {
                  this.props.post && this.props.post.isPublished &&
                  <span className='flex justify-center items-center'>Post successfully published</span>
                }
              </div>
            </div>
          </div>
        </div>
      </AdminPageContainer>
    );
  }
}

export default withRouter(EditPost);

export const getServerSideProps: GetServerSideProps = async (context: any): Promise<any> => {
  const { postId } = context.params;
  const session = await getSession(context);
  if (!session) {
    return {
      props: {}
    };
  }

  const connection = await dbConnection('post');
  const postRepository = connection.getRepository(Post);
  const post = await postRepository.findOne({ id: postId });
  await connection.close();

  return {
    props: {
      postId,
      post: JSON.parse(JSON.stringify(post))
    }
  };
}
