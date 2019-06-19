import { assert } from 'chai'

import { config } from '../config'

import { Ocean, OceanPlatformTechStatus } from '../../src' // @oceanprotocol/squid

describe('Versions', () => {
    let ocean: Ocean

    before(async () => {
        ocean = await Ocean.getInstance(config)
    })

    it('should returns the versions', async () => {
        const versions = await ocean.versions.get()

        assert.equal(versions.aquarius.status, OceanPlatformTechStatus.Working)
        assert.equal(versions.brizo.status, OceanPlatformTechStatus.Working)
        assert.equal(versions.squid.status, OceanPlatformTechStatus.Working)

        assert.deepEqual(versions.status, {
            ok: true,
            contracts: true,
            network: true
        })
    })
})
