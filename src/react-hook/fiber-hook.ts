
import { readContext } from '../react-context/fiber-context'
import { ExpirationTime, NoWork } from '../react-fiber/expiration-time'
import { Fiber } from '../react-fiber/fiber'
import { Passive, Update } from '../react-type/effect-type'
import { BasicStateAction, Dispatch, Dispatcher, Hook } from '../react-type/hook-type'
import { isFunction } from '../utils/getType'
import ReactCurrentDispatcher from './rect-current-dispatcher'

const didScheduleRenderPhaseUpdate: boolean = false

let renderExpirationTime: ExpirationTime = NoWork
let currentlyRenderingFiber: Fiber = null
let nextCurrentHook: Hook = null

let currentHook: Hook = null
let nextCurrentHook: Hook = null

let firstWorkInProgressHook: Hook = null
let workInProgressHook: Hook = null
let nextWorkInProgressHook: Hook = null

function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseUpdate: null,
    queue: null,
    next: null,
  }

  if (workInProgressHook === null) {
    firstWorkInProgressHook = workInProgressHook = hook // 第一次
  } else {
    workInProgressHook = workInProgressHook.next = hook // 插入链表中
  }
  return workInProgressHook
}

function updateWorkInProgressHook(): Hook {
  if (nextWorkInProgressHook) {
    workInProgressHook = nextWorkInProgressHook
    nextWorkInProgressHook = workInProgressHook.next

    currentHook = nextCurrentHook
    nextCurrentHook = currentHook !== null ? currentHook.next : null
  } else {
    currentHook = nextCurrentHook

    const newHook: Hook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      queue: currentHook.queue,
      baseUpdate: currentHook.baseUpdate,
      next: null,
    }

    if (workInProgressHook === null) {
      workInProgressHook = firstWorkInProgressHook = newHook // 第一次
    } else {
      workInProgressHook = workInProgressHook.next = newHook// 插入链表中
    }
    nextCurrentHook = currentHook.next
  }
  return workInProgressHook
}

const State = {
  basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
    return isFunction(action) ? (action as Function)(state) : action
  },

  mountState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
    const hook: Hook = mountWorkInProgressHook()
    const queue

    return null
  },
}



const HooksDispatcherOnMount: Dispatcher = {
  readContext,

  useState: mountState,
  useEffect: mountEffect,
  useContext: readContext,

  useReducer: mountReducer,
  useCallback: mountCallback,
  useMemo: mountMemo,
  useRef: mountRef,
  useLayoutEffect: mountLayoutEffect,
}

const HooksDispatcherOnUpdate: Dispatcher = {
  readContext,

  useState: updateState,
  useEffect: updateEffect,
  useContext: readContext,

  useReducer: updateReducer,
  useCallback: updateCallback,
  useMemo: updateMemo,
  useRef: updateRef,
  useLayoutEffect: updateLayoutEffect,
}



function bailoutHooks(current: Fiber, workInProgress: Fiber, expirationTime: ExpirationTime) {
  workInProgress.updateQueue = current.updateQueue
  workInProgress.effectTag &= ~(Passive | Update)
  if (current.expirationTime <= expirationTime) {
    current.expirationTime = NoWork
  }
}

function renderWithHooks(current: Fiber, workInProgress: Fiber, Component: Function, props: any, refOrContext: any, nextRenderExpirationTime: ExpirationTime): any {
  renderExpirationTime = nextRenderExpirationTime
  currentlyRenderingFiber = workInProgress
  nextCurrentHook = current !== null ? current.memoizedState : null

  ReactCurrentDispatcher.current = nextCurrentHook === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate

  const children: any = Component(props, refOrContext)
  // 待实现
  // if (didScheduleRenderPhaseUpdate) {

  // }

  return children
}

export { bailoutHooks, renderWithHooks }