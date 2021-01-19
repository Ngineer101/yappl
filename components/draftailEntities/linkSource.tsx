import React, { useRef, useState } from "react";
import { RichUtils, EditorState, EntityInstance, Modifier, Entity } from "draft-js";
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
      className='image-modal adjusted-width'
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
      <form onSubmit={(evt) => {
        evt.preventDefault();
        if (url) { // TODO: Validate url
          const data = {
            href: url.replace(/\s/g, ""),
          };

          const entityKey = Entity.create('LINK', 'MUTABLE', data);
          const selection = props.editorState.getSelection();
          const contentState = Modifier.applyEntity(props.editorState.getCurrentContent(), selection, entityKey);
          const linkState = EditorState.push(props.editorState, contentState, 'apply-entity');
          const styledLinkState = RichUtils.toggleInlineStyle(linkState, "UNDERLINE");
          const collapsed = selection.merge({
            anchorOffset: selection.getEndOffset(),
            focusOffset: selection.getEndOffset()
          });

          const newEditorState = EditorState.forceSelection(styledLinkState, collapsed);
          const updatedSelection = newEditorState.getSelection();
          const updatedContentState = Modifier.insertText(newEditorState.getCurrentContent(), updatedSelection, ' ');
          const nextState = EditorState.push(newEditorState, updatedContentState, 'insert-characters');
          props.onComplete(nextState);
        }
      }}>
        <input
          name='linkUrl'
          className='input-default mb-2'
          placeholder='https://www.example.com'
          onChange={(evt) => setUrl(evt.currentTarget.value)}
          ref={(inputRef) => urlInputRef.current = inputRef} />

        <button className='btn-default w-full' type='submit'>Add</button>
      </form>
    </Modal>
  );
}
