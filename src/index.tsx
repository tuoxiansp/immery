/**
 * 序列化 & 反序列化 React 写的界面
 */

import * as React from 'react'
import { produce, applyPatches, setAutoFreeze, Patch } from 'immer'

setAutoFreeze(false)

type ProduceWithPatches = <T>(data: T, mut: (draft: T) => any) => [T, Patch[], Patch[]]

const produceWithPatches: ProduceWithPatches = (data, mut) => {
    let patches: Patch[] | undefined, reverses: Patch[] | undefined

    const nextData = produce(data, mut, (a, b) => {
        patches = a
        reverses = b
    })

    return [ nextData, patches as Patch[], reverses as Patch[] ]
}

const doNothing = () => {}

const { useContext, createContext } = React

type Change = Patch[]

type ImmeryValue = { immery: object; changes: Change[]; inverseChanges: Change[]; processingChanges: Change[] }

export const createEmptyData: () => ImmeryValue = () => ({
    immery: {},
    changes: [],
    inverseChanges: [],
    processingChanges: [],
})

const ImmeryValueContext = createContext<ImmeryValue>(createEmptyData())

type PropSetter = (propValue: any) => void

type HookProps = <T>(propName: string) => [T, PropSetter]

type ImmeryHandlers = {
    undoable: number
    redoable: number
    undo: () => ImmeryValue
    redo: () => ImmeryValue
}

type ImmeryPropsType = {
    data: ImmeryValue
    onChange: (nextData: any) => void
    children: (handlers: ImmeryHandlers) => React.ReactElement
}

type ProducePropSetterType = ((propName: string) => PropSetter)

const ImmeryOperateContext = createContext<ProducePropSetterType>(() => () => {
    throw new Error('Something is wrong.')
})

export const Immery: React.FunctionComponent<ImmeryPropsType> = ({ data, onChange = doNothing, children }) => {
    const undoable = data.inverseChanges.length,
        redoable = data.processingChanges.length

    return (
        <ImmeryValueContext.Provider value={data}>
            <ImmeryOperateContext.Provider
                value={(propName) => (propValue) => {
                    const [ nextData, patches, inversePatches ] = produceWithPatches(data, (draft: ImmeryValue) => {
                        draft.immery[propName] = propValue
                    })

                    if (!patches.length) {
                        return
                    }

                    const processingChanges: Change[] = []
                    const changes = [ patches, ...data.changes ]
                    const inverseChanges = [ inversePatches, ...data.inverseChanges ]

                    const applyPatchData = produce(nextData, (draft: ImmeryValue) => {
                        draft.changes = changes
                        draft.inverseChanges = inverseChanges
                        draft.processingChanges = processingChanges
                    })

                    onChange(applyPatchData)
                }}
            >
                {children({
                    undoable,
                    redoable,
                    redo() {
                        if (!redoable) {
                            throw new Error('Not redoable now.')
                        }
                        let { changes, inverseChanges, processingChanges } = data
                        const patches = changes[processingChanges.length - 1]
                        inverseChanges = [ processingChanges.shift() as Change, ...inverseChanges ]

                        return produce(applyPatches(data, patches), (draft: ImmeryValue) => {
                            draft.inverseChanges = inverseChanges
                            draft.processingChanges = processingChanges
                        })
                    },
                    undo() {
                        if (!undoable) {
                            throw new Error('Not undoable now.')
                        }
                        let { inverseChanges, processingChanges } = data
                        const patches = inverseChanges.shift() as Change
                        processingChanges = [ patches, ...processingChanges ]

                        return produce(applyPatches(data, patches), (draft: ImmeryValue) => {
                            draft.inverseChanges = inverseChanges
                            draft.processingChanges = processingChanges
                        })
                    },
                })}
            </ImmeryOperateContext.Provider>
        </ImmeryValueContext.Provider>
    )
}

export const useProp: HookProps = (propName: string) => {
    const produceSetProp = useContext(ImmeryOperateContext)
    const value = useContext(ImmeryValueContext)

    return [ value.immery[propName], produceSetProp(propName) ]
}

export default Immery
