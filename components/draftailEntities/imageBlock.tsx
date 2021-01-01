import { ContentBlock, EditorState, EntityInstance } from "draft-js";

export default function ImageBlock(props: {
  block: ContentBlock,
  blockProps: {
    editorState: EditorState,
    entity: EntityInstance,
    entityKey: string,
    entityType: {},
    lockEditor: () => void,
    unlockEditor: () => void,
    onEditEntity: (entityKey: string) => void,
    onRemoveEntity: (entityKey: string, blockKey: string) => void,
    onChange: (editorState: EditorState) => void,
  },
}) {
  const { src, alt } = props.blockProps.entity.getData();
  return <img src={src} alt={alt} style={{ width: '100%' }} />
}
