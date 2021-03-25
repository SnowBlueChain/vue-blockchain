import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import {
    TransactionResponse,
    TransactionQueryResponse,
    TransactionsState,
} from './models'
import { getTransaction, ITransactionPayload } from '@/services/transactions'
import { Transaction } from '@/js/Transaction'

const defaultState = {
    tx: null,
    txRes: {
        startTime: '',
        endTime: '',
        next: '',
        transactions: [],
    },
    recentTxRes: {
        startTime: '',
        endTime: '',
        next: '',
        transactions: [],
    },
    assetTxRes: {
        startTime: '',
        endTime: '',
        next: '',
        transactions: [],
    },
    addressTxRes: {
        startTime: '',
        endTime: '',
        next: '',
        transactions: [],
    },
}

const transactions_module: Module<TransactionsState, IRootState> = {
    namespaced: true,
    modules: {},
    state: defaultState,
    mutations: {
        addTx(state, tx: Transaction) {
            state.tx = tx
        },
        addTxs(state, txRes: TransactionQueryResponse) {
            state.txRes = txRes
        },
        addRecentTxs(state, txRes: TransactionQueryResponse) {
            state.recentTxRes = txRes
        },
        addAssetTxs(state, txRes: TransactionQueryResponse) {
            state.assetTxRes = txRes
        },
        addAddressTxs(state, txRes: TransactionQueryResponse) {
            state.addressTxRes = txRes
        },
    },
    actions: {
        async getTx(store, payload: ITransactionPayload) {
            const txRes: TransactionResponse = await getTransaction(payload.id)
            if (txRes) store.commit('addTx', new Transaction(txRes))
        },
        async getTxs(store, payload: ITransactionPayload) {
            const txRes: TransactionQueryResponse = await getTransaction(
                payload.id,
                payload.params
            )
            store.commit('addTxs', txRes)
        },
        async getRecentTxs(store, payload: ITransactionPayload) {
            const txRes: TransactionQueryResponse = await getTransaction(
                payload.id,
                payload.params
            )
            store.commit('addRecentTxs', txRes)
        },
        async getTxsByAsset(store, payload: ITransactionPayload) {
            const txRes: TransactionQueryResponse = await getTransaction(
                payload.id,
                payload.params
            )
            store.commit('addAssetTxs', txRes)
        },
        async getTxsByAddress(store, payload: ITransactionPayload) {
            const txRes: TransactionQueryResponse = await getTransaction(
                payload.id,
                payload.params
            )
            store.commit('addAddressTxs', txRes)
        },
    },
}
export default transactions_module
