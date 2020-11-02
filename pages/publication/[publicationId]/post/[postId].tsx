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
  title: string;
  subTitle: string;
  editorState: EditorState;
}

export default class EditPost extends Component<IEditPostProps, IEditPostState> {

  constructor(props: IEditPostProps) {
    super(props);
    this.savePost = this.savePost.bind(this);
    this.state = {
      isSaving: false,
      savedSuccess: false,
      savedFail: false,
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

  savePost = (evt: any, publicationId: string, postId: string, title: string, subTitle: string,
    htmlContent: string, textContent: string) => {
    this.setState({
      isSaving: true,
      savedSuccess: false,
      savedFail: false
    });
    axios.post(`/api/publication/post?publicationId=${publicationId}&postId=${postId}`, {
      title,
      subTitle,
      htmlContent,
      textContent,
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

  render() {
    return (
      <Container protected>
        {
          this.props.session &&
          <div className='flex flex-col justify-center items-center h-full'>
            <div className='adjusted-width shadow-2xl rounded bg-white p-4 flex-1 h-full flex flex-col justify-between'>
              <div>
                <h1 className='max-w-full'>
                  <input type='text' placeholder='Title' value={this.state.title} onChange={(evt) => this.setState({ title: evt.currentTarget.value })} />
                </h1>
                <h3>
                  <input type='text' placeholder='Subtitle' value={this.state.subTitle} onChange={(evt) => this.setState({ subTitle: evt.currentTarget.value })} />
                </h3>
                <hr />
              </div>
              <div className='mb-4 flex-1'>
                <Editor
                  editorState={this.state.editorState}
                  wrapperClassName='demo-wrapper'
                  editorClassName='demo-editor'
                  onEditorStateChange={(contentState: any) => {
                    this.setState({ editorState: contentState, savedSuccess: false });
                  }}
                />
              </div>

              <div className='mt-4'>
                <button className='btn-default' disabled={this.state.savedSuccess} onClick={(evt) => {
                  this.savePost(evt, this.props.publicationId, this.props.postId, this.state.title, this.state.subTitle,
                    draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())), ''); // TODO: Add text content
                }}>
                  {
                    this.state.isSaving &&
                    <svg className="animate-spin h-5 w-5 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
                  }
                  {
                    this.state.savedSuccess &&
                    <>
                      <span>Saved</span>
                      <br />
                      <small className='text-gray-700'>{new Date().getHours().toString()}:{new Date().getMinutes().toString()}:{new Date().getSeconds().toString()}</small>
                    </>
                  }
                  {
                    this.state.savedFail &&
                    <span>Saving fail</span>
                  }
                  {
                    !this.state.isSaving && !this.state.savedSuccess && !this.state.savedFail &&
                    <span>Save</span>
                  }
                </button>
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
