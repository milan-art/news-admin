import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const controls = [
  { label: 'Bold', command: 'bold', icon: '𝐁' },
  { label: 'Italic', command: 'italic', icon: '𝑰' },
  { label: 'Underline', command: 'underline', icon: 'U̲' },
  { label: 'Bullet list', command: 'insertUnorderedList', icon: '•' },
  { label: 'Numbered list', command: 'insertOrderedList', icon: '1.' },
  { label: 'Quote', command: 'formatBlock', value: 'blockquote', icon: '❝' },
]

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleCommand = (command, commandValue) => {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    onChange(editorRef.current?.innerHTML ?? '')
  }

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML ?? '')
  }

  return (
    <div className="rich-editor">
      <div className="rich-editor__toolbar" role="toolbar">
        {controls.map((control) => (
          <button
            key={control.label}
            type="button"
            className="btn-icon"
            onClick={() => handleCommand(control.command, control.value)}
            aria-label={control.label}
          >
            {control.icon}
          </button>
        ))}
        <button
          type="button"
          className="btn-icon"
          onClick={() => handleCommand('removeFormat')}
          aria-label="Clear formatting"
        >
          ⌫
        </button>
      </div>
      <div
        className="rich-editor__content"
        ref={editorRef}
        contentEditable
        role="textbox"
        data-placeholder="Write your story..."
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
      />
    </div>
  )
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}

RichTextEditor.defaultProps = {
  value: '',
}

export default RichTextEditor

