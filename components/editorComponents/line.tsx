import { AtomicBlockUtils } from "draft-js";
import { HORIZONTAL_LINE } from "../../constants/editorEntityType";
import { INewEditorComponentProps } from "./INewEditorComponentProps";

export default function Line({
  editorState,
  onChange
}: any) {
  return (
    <div className='rdw-image-wrapper'>
      <div className='rdw-option-wrapper'
        onClick={() => {
          const contentState = editorState.getCurrentContent();
          const contentStateWithEntity = contentState.createEntity(HORIZONTAL_LINE, 'IMMUTABLE', {});
          const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
          const updatedEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
          onChange(updatedEditorState);
        }}>
        <img src={require('../../public/assets/icons/horizontal_rule.svg')} alt='horizontal rule' />
      </div>
    </div>
  );
}
