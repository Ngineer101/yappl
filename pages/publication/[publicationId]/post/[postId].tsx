import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { getSession, Session } from 'next-auth/client';
import { Component } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import axios from 'axios';
import Container from '../../../../components/container';
import { Post } from '../../../../models';
import { dbConnection } from '../../../../repository';

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
  title: string;
  subTitle: string;
  editorState: EditorState;
}

export default class EditPost extends Component<IEditPostProps, IEditPostState> {

  timeout: any = null;

  constructor(props: IEditPostProps) {
    super(props);
    this.savePost = this.savePost.bind(this);
    this.publishPost = this.publishPost.bind(this);
    this.savePostWithTimeout = this.savePostWithTimeout.bind(this);
    this.state = {
      isSaving: false,
      savedSuccess: false,
      savedFail: false,
      isPublishing: false,
      publishFail: false,
      title: props.post ? props.post.title : '',
      subTitle: props.post ? props.post.subtitle : '',
      editorState: EditorState.createEmpty()
    }
  }

  componentDidMount() {
    const post = this.props.post ? this.props.post : { htmlContent: '' };
    if (post.htmlContent) {
      const blocksFromHtml = convertFromHTML(post.htmlContent as any);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      this.setState({ editorState: EditorState.createWithContent(contentState) });
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
      htmlContent: draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())),
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
    // TODO: Add confirmation before publishing
    this.setState({
      isPublishing: true,
      publishFail: false
    });
    axios.post(`/api/publication/publish-post?publicationId=${this.props.publicationId}&postId=${this.props.postId}`, {
      title: this.state.title,
      subTitle: this.state.subTitle,
      htmlContent: draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())),
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

  render() {
    return (
      <Container protected>
        {
          this.props.session &&
          <div className='flex flex-col justify-center items-center h-full'>
            <div className='adjusted-width shadow-2xl rounded bg-white px-4 flex-1 h-full flex flex-col justify-between -mt-12'>
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
                    options: ['inline', 'blockType', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
                  }}
                  editorState={this.state.editorState}
                  toolbarClassName='default-toolbar'
                  onEditorStateChange={(contentState: any) => {
                    this.setState({ editorState: contentState, savedSuccess: false }, () => this.savePostWithTimeout());
                  }}
                />
              </div>

              <div className='mt-4 pb-4 bottom-0 sticky z-20 bg-white flex flex-col'>
                <hr className='mt-0' />
                <div className='flex justify-between'>
                  <button className='btn-default' disabled={this.state.savedSuccess} onClick={this.savePost}>
                    {
                      this.state.isSaving &&
                      <svg className="animate-spin h-5 w-5 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
                    }
                    {
                      this.state.savedSuccess &&
                      <span>Saved at {new Date().getHours().toString()}:{new Date().getMinutes().toString()}</span>
                    }
                    {
                      this.state.savedFail &&
                      <span>Saving failed</span>
                    }
                    {
                      !this.state.isSaving && !this.state.savedSuccess && !this.state.savedFail &&
                      <span>Save</span>
                    }
                  </button>

                  {
                    this.props.post && !this.props.post.isPublished &&
                    <button className='btn-default' onClick={this.publishPost}>
                      {
                        this.state.isPublishing &&
                        <svg className="animate-spin h-5 w-5 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
                      }
                      {
                        !this.state.isPublishing &&
                        <span>Publish</span>
                      }
                    </button>
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
      </Container>
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
