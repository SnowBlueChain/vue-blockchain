import Big from 'big.js'
import SubnetDict from './known_subnets'
import BlockchainDict from './known_blockchains'
import VMDict from './known_vms'
import { Quote, quotes } from './quotes'
import { BN, Buffer } from 'avalanche/dist'
import { NFTTransferOutput, UTXO } from 'avalanche/dist/apis/avm'
import { PayloadBase, PayloadTypes } from 'avalanche/dist/utils'
import { IAddress } from './services/addresses/models'

function stringToBig(raw: string, denomination = 0): Big {
    return Big(raw).div(Math.pow(10, denomination))
}

/**
 * Convert nAvax to Avax
 * @param nAVAX nAvax amount
 */
function nAvaxToAVAX(nAVAX: string | number): number {
    return typeof nAVAX === 'string'
        ? parseInt(nAVAX) / Math.pow(10, 9)
        : nAVAX / Math.pow(10, 9)
}

function bigToDenomBig(val: Big, denomination = 0): Big {
    return val.div(Math.pow(10, denomination))
}

function bnToBig(val: BN, denomination = 0): Big {
    return new Big(val.toString()).div(Math.pow(10, denomination))
}

function subnetMap(id: string): string {
    if (SubnetDict[id]) {
        return SubnetDict[id]
    } else {
        return id
    }
}

function blockchainMap(id: string): string {
    if (BlockchainDict[id]) {
        return BlockchainDict[id]
    } else {
        return id
    }
}

function VMMap(id: string): string {
    if (VMDict[id]) {
        return VMDict[id].name
    } else {
        return id
    }
}

function VMDocumentationMap(id: string): string {
    if (VMDict[id]) {
        return VMDict[id].documentation
    } else {
        return ''
    }
}

function getRandomQuote(): Quote {
    return quotes[Math.floor(Math.random() * quotes.length)]
}

function countDecimals(value: number): [boolean, number] {
    if (value <= 1e-7) {
        return [true, parseInt(value.toString().split('-')[1])]
    } else if (Math.floor(value) !== value) {
        return [false, value.toString().split('.')[1].length || 0]
    }
    return [false, 0]
}

function trimmedLocaleString(
    amount: Big,
    denomination = 0,
    normalize = true
): string {
    // produce a localeString with trimmed trailing 0s
    // e.g. 44999999.999120000 to 44,999,999.99912

    // convert and denominate
    const denominatedAmt = normalize
        ? amount.div(Math.pow(10, denomination)).toFixed(denomination)
        : amount.toFixed(denomination)

    // determine cutoff point for trailing 0s
    // handle scientific notation and decimal formats
    const number = parseFloat(denominatedAmt)
    const [scientific, decimalPlaces] = countDecimals(number)

    return scientific
        ? amount.div(Math.pow(10, denomination)).toFixed(denomination)
        : amount.div(Math.pow(10, denomination)).toLocaleString(decimalPlaces)
}

const DEFAULT_NETWORK_ID = parseInt(
    process.env.VUE_APP_DEFAULT_NETWORKID || '4'
)

export function isMainnetNetwork() {
    return DEFAULT_NETWORK_ID === 1
}

export const XChainInfo = {
    id: (isMainnetNetwork()
        ? process.env.VUE_APP_XCHAINID
        : process.env.VUE_APP_TEST_XCHAINID) as string,
    name: 'X-Chain',
    code: 'X',
}

export const PChainInfo = {
    id: (isMainnetNetwork()
        ? process.env.VUE_APP_PCHAINID
        : process.env.VUE_APP_TEST_PCHAINID) as string,
    name: 'P-Chain',
    code: 'P',
}

export const CChainInfo = {
    id: (isMainnetNetwork()
        ? process.env.VUE_APP_CCHAINID
        : process.env.VUE_APP_TEST_CCHAINID) as string,
    name: 'C-Chain',
    code: 'C',
}

const payloadtypes = PayloadTypes.getInstance()

function getPayloadFromUTXO(utxo: UTXO): PayloadBase {
    const out = utxo.getOutput() as NFTTransferOutput
    const payload = out.getPayloadBuffer()
    const typeId = payloadtypes.getTypeID(payload)
    const pl = payloadtypes.getContent(payload)
    const payloadbase: PayloadBase = payloadtypes.select(typeId, pl)
    return payloadbase
}

function pushPayload(rawPayload: string, assetID: string, groupID: number) {
    const res: { [key in string]: { [key in string]: PayloadBase[] } } = {}
    let payload = Buffer.from(rawPayload, 'base64')
    payload = Buffer.concat([new Buffer(4).fill(payload.length), payload])

    try {
        const typeId = payloadtypes.getTypeID(payload)
        const pl = payloadtypes.getContent(payload)
        const payloadbase: PayloadBase = payloadtypes.select(typeId, pl)

        if (res[assetID]) {
            if (res[assetID][groupID]) {
                return res[assetID][groupID].push(payloadbase)
            } else {
                return (res[assetID] = {
                    [groupID]: [payloadbase],
                })
            }
        } else {
            return (res[assetID] = {
                [groupID]: [payloadbase],
            })
        }
    } catch (e) {
        console.error(e)
    }
}

function getNullAddress(id: string, key = ''): IAddress {
    return {
        address: id,
        publicKey: key,
        // P-Chain AVAX balance
        AVAX_balance: Big(0),
        P_unlocked: Big(0),
        P_lockedStakeable: Big(0),
        P_lockedNotStakeable: Big(0),
        P_staked: Big(0),
        P_utxoIDs: [],
        // X-Chain AVAX balance
        X_unlocked: Big(0),
        X_locked: Big(0),
        // X-Chain Assets
        assets: [],
    }
}

export {
    nAvaxToAVAX as toAVAX,
    stringToBig,
    bigToDenomBig,
    bnToBig,
    subnetMap,
    blockchainMap,
    VMMap,
    VMDocumentationMap,
    getRandomQuote,
    trimmedLocaleString,
    getPayloadFromUTXO,
    pushPayload,
    getNullAddress,
}
