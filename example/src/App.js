import React, { Component, useState, useEffect } from 'react'

import Immery, { useProp, createEmptyData } from 'immery'

const Input = () => {
    const [ input = {}, mut ] = useProp('input')

    return (
        <div>
            input: {input.text || ''}
            <div>
                <input
                    type="text"
                    value={input.text || ''}
                    onChange={(event) =>
                        mut((input = {}) => {
                            input.text = event.target.value
                            return input
                        })}
                />
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
