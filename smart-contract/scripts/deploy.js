const main = async () => {
    // const btFactory = await hre.ethers.getContractFactory('BitHo')
    // const btContract = await btFactory.deploy()
    // await btContract.deployed()
    // console.log('BitHo deployed to:', btContract.address)

    // const bitFactory = await hre.ethers.getContractFactory('BitTo')
    // const bitContract = await bitFactory.deploy()
    // await bitContract.deployed()
    // console.log('BitTo deployed to:', bitContract.address)

    // const flFactory = await hre.ethers.getContractFactory('FLuna')
    // const flContract = await flFactory.deploy()
    // await flContract.deployed()
    // console.log('Fluna deployed to:', flContract.address)

    const scFactory = await hre.ethers.getContractFactory("Scoin")
    const scContract = await scFactory.deploy()
    await scContract.deployed()
    console.log("Scoin deployed to:", scContract.address)
}

;(async () => {
    try {
        await main()
        process.exit(0)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
})()
