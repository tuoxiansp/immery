# immery

> Serialize and deserialize your React GUI.

[![NPM](https://img.shields.io/npm/v/immery.svg)](https://www.npmjs.com/package/immery)

## Install

```bash
npm install --save immery
```

## Usage

```tsx
import React, { Component, useState, useEffect } from 'react'
import Immery, {useProps, createEmptyData} from 'immery'

const Input = () => {
    const [ input, setInput ] = useProp('input')

    return (
        <div>
            input: {input}
            <div>
                <input type="text" value={input || ''} onChange={(event) => setInput(event.target.value)} />
            </div>
        </div>
    )
}

const App = () => {
    const [ data, setData ] = useState(() => createEmptyData())

    return (
        <Immery
            data={data}
            onChange={setData}
        >
            {({ undoable, redoable, undo, redo }) => {
                return (
                    <div>
                        <button
                            disabled={!undoable}
                            onClick={() => {
                                setData(undo())
                            }}
                        >
                            undo
                        </button>
                        <button
                            disabled={!redoable}
                            onClick={() => {
                                setData(redo())
                            }}
                        >
                            redo
                        </button>
                        <Input />
                    </div>
                )
            }}
        </Immery>
    )
}
```

## License

MIT © [tuoxiansp](https://github.com/tuoxiansp)
