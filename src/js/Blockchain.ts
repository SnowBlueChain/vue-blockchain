import { IBlockchainData } from '@/store/modules/platform/IBlockchain'
import { P, X, C } from '@/known_blockchains'
import { profanities } from '@/js/Profanities'

export default class Blockchain {
    id: string
    name: string
    subnetID: string
    vmID: string
    indexed?: boolean
    profane?: boolean

    constructor(data: IBlockchainData) {
        this.id = data.id
        this.name = data.name
        this.subnetID = data.subnetID
        this.vmID = data.vmID
        this.indexed = this.updateIndexed()
        this.profane = false
        this.checkForProfanities(this.name)
    }

    private updateIndexed(): boolean {
        switch (this.id) {
            case P.id:
                return true
            case X.id:
                return true
            case C.id:
                return true
            default:
                return false
        }
    }

    private checkForProfanities(value: string): void {
        if (this.profane) {
            return
        }
        this.profane = profanities.screen(value)
    }
}
