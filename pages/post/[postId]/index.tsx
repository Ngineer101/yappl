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
                enableHorizontalRule={true}
                stripPastedStyles={false}
                spellCheck={true}
                blockTypes={[
                  { type: BLOCK_TYPE.UNSTYLED },
                  { type: BLOCK_TYPE.HEADER_ONE },
                  { type: BLOCK_TYPE.HEADER_TWO },
                  { type: BLOCK_TYPE.HEADER_THREE },
                  { type: BLOCK_TYPE.HEADER_FOUR },
                  { type: BLOCK_TYPE.HEADER_FIVE },
                  { type: BLOCK_TYPE.HEADER_SIX },
                  { type: BLOCK_TYPE.UNORDERED_LIST_ITEM },
                  { type: BLOCK_TYPE.ORDERED_LIST_ITEM },
                  { type: BLOCK_TYPE.BLOCKQUOTE },
                  { type: BLOCK_TYPE.CODE },
                ]}
                inlineStyles={[
                  { type: INLINE_STYLE.BOLD },
                  { type: INLINE_STYLE.ITALIC },
                  { type: INLINE_STYLE.UNDERLINE },
                ]}
                entityTypes={[
                  {
                    type: ENTITY_TYPE.LINK,
                    description: 'Insert link',
                    attributes: ['href'],
                    whitelist: {
                      href: "^(?![#/])",
                    },
                    source: LinkSource,
                  },
                  {
                    type: ENTITY_TYPE.IMAGE,
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
