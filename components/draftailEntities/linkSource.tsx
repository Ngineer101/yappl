import React, { useRef, useState } from "react";
import { RichUtils, EditorState, EntityInstance } from "draft-js";
import Modal from 'react-modal';

export default function LinkSource(props: {
  editorState: EditorState,
  onComplete: (editorState: EditorState) => void,
  onClose: () => void,
  entityType: {
    type: string,
  },
  entity?: EntityInstance,
}) {
  const { href } = props.entity ? props.entity.getData() : { href: '' };
  const [url, setUrl] = useState(href);
  const urlInputRef = useRef<HTMLInputElement | null>();
  return (
    <Modal
      className='image-modal'
      overlayClassName='overlay-image-modal'
      ariaHideApp={false}
      portalClassName='portal-image-modal'
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      onRequestClose={(evt) => {
        evt.preventDefault();
        props.onClose();
      }}
      onAfterOpen={() => {
        if (urlInputRef.current) {
          urlInputRef.current.focus();
          urlInputRef.current.select();
        }
      }}
      isOpen
      contentLabel='Insert link'>
      <div>
        <input
          name='linkUrl'
          className='input-default mb-2'
          placeholder='https://www.example.com'
          onChange={(evt) => setUrl(evt.currentTarget.value)}
          ref={(inputRef) => urlInputRef.current = inputRef} />

        <button className='btn-default w-full' type='button' onClick={() => {
          if (url) { // TODO: Validate url
            const contentState = props.editorState.getCurrentContent();
            const data = {
              href: url.replace(/\s/g, ""),
            };

            const contentStateWithEntity = contentState.createEntity(props.entityType.type, "MUTABLE",
              data,
            );
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
            const nextState = RichUtils.toggleLink(props.editorState, props.editorState.getSelection(), entityKey)
            props.onComplete(nextState);
          }
        }}>Add</button>
      </div>
    </Modal>
  );
}
