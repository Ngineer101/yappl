import { AtomicBlockUtils } from "draft-js";
import { HORIZONTAL_LINE } from "../../constants/editorEntityType";

export default function Line({
  editorState,
  onChange
}: any) {
  return (
    <div className='flex flex-col justify-center items-center'
      onClick={() => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(HORIZONTAL_LINE, 'IMMUTABLE', {});
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const updatedEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
        onChange(updatedEditorState);
      }}>
      <span className='text-xs'>Line</span>
      <hr className='bg-black m-0 h-0.5 w-6' />
    </div>
  );
}
