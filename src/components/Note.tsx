import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Strike from '@tiptap/extension-strike'
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'

import EditorCodeBlock, { CODE_BLOCK_DEFAULT_LANGUAGE } from 'components/EditorCodeBlock'
import Flex from 'components/Flex'
import NoteInspector from 'components/NoteInspector'
import Shimmer from 'components/Shimmer'
import useContentId from 'hooks/useContentId'
import useNote from 'hooks/useNote'
import { lowlight } from 'libs/lowlight'
import clst from 'styles/clst'
import styles from 'styles/Note.module.css'

// FIXME(HiDeoo)
const content = `<h1>Plop</h1><p>234452222223</p><ul><li><p>test</p><ul><li><p>test</p><ul><li><p>test</p></li></ul></li><li><p>test</p></li></ul></li></ul><p>test</p><p>test</p><pre><code class="language-javascript">function $initHighlight(block, cls) {
  try {
    if (cls.search(/no-highlight/) != -1)
      return process(block, true, 0x0F) +
             \` class="\${cls}"\`;
  } catch (e) {
    /* handle exception */
  }
  for (var i = 0 / 2; i &lt; classes.length; i++) {
    if (checkCondition(classes[i]) === undefined)
      console.log('undefined');
  }

  return (
    &lt;div&gt;
      &lt;web-component&gt;{block}&lt;/web-component&gt;
    &lt;/div&gt;
  )
}

export  $initHighlight;</code></pre><p>test</p><pre><code class="language-bash">#!/bin/bash

###### CONFIG
ACCEPTED_HOSTS="/root/.hag_accepted.conf"
BE_VERBOSE=false

if [ "$UID" -ne 0 ]
then
 echo "Superuser rights required"
 exit 2
fi

genApacheConf(){
 echo -e "# Host \${HOME_DIR}$1/$2 :"
}

echo '"quoted"' | tr -d " &gt; text.txt</code></pre><p>test</p><pre><code class="language-markdown"># hello world

you can write text [with links](http://example.com) inline or [link references][1].

* one _thing_ has *em*phasis
* two __things__ are **bold**

[1]: http://example.com

---

hello world
===========

&lt;this_is inline="xml"&gt;&lt;/this_is&gt;

&gt; markdown is so cool

    so are code segments

1. one thing (yeah!)
2. two thing \`i can write code\`, and \`more\` wipee!</code></pre><p>test</p><pre><code class="language-diff">Index: languages/ini.js
===================================================================
--- languages/ini.js    (revision 199)
+++ languages/ini.js    (revision 200)
@@ -1,8 +1,7 @@
 hljs.LANGUAGES.ini =
 {
   case_insensitive: true,
-  defaultMode:
-  {
+  defaultMode: {
     contains: ['comment', 'title', 'setting'],
     illegal: '[^\\s]'
   },

*** /path/to/original timestamp
--- /path/to/new      timestamp
***************
*** 1,3 ****
--- 1,9 ----
+ This is an important
+ notice! It should
+ therefore be located at
+ the beginning of this
+ document!

! compress the size of the
! changes.

  It is important to spell</code></pre>`

const shimmerClasses = [
  'w-2/5 h-12',
  'w-11/12',
  'w-2/6 h-8',
  'w-10/12',
  'w-full',
  'w-full',
  'w-3/5',
  'w-3/6 h-8',
  'w-full',
  'w-10/12',
  'w-9/12',
  'w-full',
  'w-10/12',
  'w-11/12',
  'w-full',
  'w-4/6',
]

const Note: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>({ pristine: true })

  const contentId = useContentId()
  const { data, isLoading } = useNote(contentId, {
    onSuccess(/* data */) {
      // editor?.chain().focus().setContent(data.html).run()
    },
    refetchOnReconnect: editorState.pristine,
    refetchOnWindowFocus: editorState.pristine,
  })

  const editorClasses = clst('h-full p-3 outline-none', styles.editor)

  const editor = useEditor({
    autofocus: 'end',
    content,
    editorProps: { attributes: { class: editorClasses, spellcheck: 'false' } },
    extensions: [
      StarterKit.configure({ codeBlock: false, strike: false }),
      Highlight,
      Strike,
      Link,
      CodeBlockLowlight.extend({ addNodeView: addCodeBlockLowlightNodeView }).configure({
        defaultLanguage: CODE_BLOCK_DEFAULT_LANGUAGE,
        lowlight,
      }),
    ],
    onUpdate() {
      setEditorState((prevEditorState) => ({ ...prevEditorState, pristine: false }))
    },
  })

  // FIXME(HiDeoo) copy(editor.getHTML())
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.editor = editor

  function onMutation(error?: unknown) {
    setEditorState({ error, pristine: !error, lastSync: error ? undefined : new Date() })
  }

  return (
    <Flex fullHeight className="overflow-hidden">
      {isLoading ? (
        <Shimmer>
          {shimmerClasses.map((classes, index) => (
            <Shimmer.Line key={index} className={classes} />
          ))}
        </Shimmer>
      ) : (
        <EditorContent editor={editor} className="grid w-full h-full overflow-y-auto" />
      )}
      <NoteInspector
        editor={editor}
        noteId={data?.id}
        disabled={isLoading}
        onMutation={onMutation}
        editorState={editorState}
      />
    </Flex>
  )
}

export default Note

function addCodeBlockLowlightNodeView() {
  return ReactNodeViewRenderer(EditorCodeBlock)
}

export interface EditorState {
  error?: unknown
  pristine: boolean
  lastSync?: Date
}
