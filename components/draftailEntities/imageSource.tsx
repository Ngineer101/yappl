import React, { useRef, useState } from "react";
import { AtomicBlockUtils, EditorState, EntityInstance } from "draft-js";
import Modal from 'react-modal';

export default function ImageSource(props: {
  editorState: EditorState,
  onComplete: (editorState: EditorState) => void,
  onClose: () => void,
  entityType: {
    type: string,
  },
  entity?: EntityInstance,
  entityKey?: string,
}) {
  const { src, alt } = props.entity ? props.entity.getData() : { src: '', alt: '' };
  const [imageSrc, setImageSrc] = useState(src);
  const [imageAlt, setImageAlt] = useState(alt);
  const srcInputRef = useRef<HTMLInputElement | null>();
  return (
    <Modal
      className='image-modal'
      overlayClassName='overlay-image-modal'
      ariaHideApp={false}
      portalClassName="portal-image-modal"
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      onRequestClose={(evt) => {
        evt.preventDefault();
        props.onClose();
      }}
      onAfterOpen={() => {
        if (srcInputRef.current) {
          srcInputRef.current.focus();
          srcInputRef.current.select();
        }
      }}
      isOpen
      contentLabel="Insert image">
      <div>
        <input
          name='imageSrc'
          className='input-default mb-2'
          placeholder='Image URL *'
          onChange={(evt) => setImageSrc(evt.currentTarget.value)}
          ref={(inputRef) => srcInputRef.current = inputRef} />

        <input
          name='imageAlt'
          className='input-default mb-2'
          placeholder='Image caption'
          onChange={(evt) => setImageAlt(evt.currentTarget.value)} />

        <button className='btn-default w-full' type='button' onClick={() => {
          if (imageSrc) { // TODO: Validate image url
            const contentState = props.editorState.getCurrentContent();
            const contentStateWithEntity = contentState.createEntity(props.entityType.type, 'IMMUTABLE', {
              src: imageSrc,
              alt: imageAlt,
            });
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
            const updatedEditorState = AtomicBlockUtils.insertAtomicBlock(props.editorState, entityKey, ' ');
            props.onComplete(updatedEditorState);
          }
        }}>Add</button>
      </div>
    </Modal>
  );
}