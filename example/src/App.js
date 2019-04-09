import React, { Component, useState, useEffect } from 'react'

import Immery, { useProp, createEmptyData } from 'immery'

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
    useEffect(
        () => {
            console.log(data.immery, 'undoable', data.inverseChanges.length, 'redoable', data.processingChanges.length)
        },
        [ data ]
    )

    return (
        <Immery
            data={data}
            onChange={(data) => {
                setData(data)
            }}
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

export default App
