import { AtomicBlockUtils } from "draft-js";
import { useEffect, useRef, useState } from "react";
import { CUSTOM_FIGURE } from "../../constants/editorEntityType";
import { INewEditorComponentProps } from "./INewEditorComponentProps";

export default function WysiwygImage(props: INewEditorComponentProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const mounted = useRef<boolean>();
  const expandedGlobal = useRef<boolean>(false);
  const callback = () => {
    setExpanded(expandedGlobal.current);
    expandedGlobal.current = false;
  }
  useEffect(() => {
    if (!mounted.current) {
      // component did mount
      props.modalHandler.registerCallBack(callback);
      mounted.current = true;
    }

    return function cleanup() {
      props.modalHandler.deregisterCallBack(callback);
    }
  }, [])

  return (
    <div className='rdw-image-wrapper' aria-haspopup="true" aria-expanded={expanded} aria-label='image-url'>
      <div className='rdw-option-wrapper'
        onClick={() => {
          if (expanded) {
            setExpanded(false);
            expandedGlobal.current = false;
          } else {
            setExpanded(true);
            expandedGlobal.current = true;
          }
        }}>
        <img src={require('../../public/assets/icons/insert_photo.svg')} alt="upload image" />
      </div>
      {
        expanded ?
          <div className='rdw-image-modal' style={{ left: -100 }} onClick={(evt) => evt.stopPropagation()}>
            <input name='imageUrl' className='input-default mb-2' placeholder='Image URL *' onChange={(evt) => setImageUrl(evt.currentTarget.value)} />
            <input name='imageCaption' className='input-default mb-2' placeholder='Image caption' onChange={(evt) => setImageCaption(evt.currentTarget.value)} />
            <button className='btn-default w-full' type='button' onClick={() => {
              if (imageUrl) { // TODO: Validate image url
                const contentState = props.editorState.getCurrentContent();
                const contentStateWithEntity = contentState.createEntity(CUSTOM_FIGURE, 'IMMUTABLE', {
                  imageUrl,
                  imageCaption,
                });
                const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
                const updatedEditorState = AtomicBlockUtils.insertAtomicBlock(props.editorState, entityKey, ' ');
                props.onChange(updatedEditorState);
                setExpanded(false);
                expandedGlobal.current = false;
              }
            }}>Add</button>
          </div>
          :
          undefined
      }
    </div >
  );
}
