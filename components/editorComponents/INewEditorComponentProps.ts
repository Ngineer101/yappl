import { EditorState } from "draft-js";

export interface INewEditorComponentProps {
  onChange: (editorState: EditorState) => void;
  editorState: EditorState;
  translations: object;
  modalHandler: {
    registerCallBack: (callback: Function) => void;
    deregisterCallBack: (callback: Function) => void;
  };
  config: object;
}
