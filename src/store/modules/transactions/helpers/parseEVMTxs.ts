import { EVMTransactionResponse } from '../models'
import { EVMBlockQueryResponse, EVMBlockLog } from '@/store/modules/blocks'
import { parseLogs } from '../../blocks/helpers/parseEVMLogs'
import { parseEVMTraces } from './parseEVMTraces'

export function getLogs(
    block: EVMBlockQueryResponse,
    transaction: EVMTransactionResponse
) {
    if (!block.logs) return []
    let logs: EVMBlockLog[] = block.logs.filter(
        (l) => l.transactionHash === transaction.hash
    )
    logs = parseLogs(logs)
    return logs
}

export function parseEVMTxs(
    tx: EVMTransactionResponse,
    block: EVMBlockQueryResponse
) {
    // Parse raw data
    const logs = getLogs(block, tx)
    const traces = tx.traces
    const tracesGraph = parseEVMTraces(tx.traces, tx.input)

    // Munge tx and block
    const transaction = {
        ...tx,
        ...block,
        logs,
        traces,
        tracesGraph,
        transfers: [],
    }
    // console.log('munged tx      ', transaction)
    return transaction
}
