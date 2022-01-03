// scripts/index.js
async function main() {
  // Our code will go here
  // Retrieve accounts from the local node
  //   const accounts = await ethers.provider.listAccounts()
  //   console.log(accounts)

  const address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  const Greeter = await ethers.getContractFactory('Greeter')
  const greeter = await Greeter.attach(address)

  await greeter.setGreeting('my name is peifeng')

  // Call the retrieve() function of the deployed Box contract
  const value = await greeter.greet()
  console.log('Greeter value is', value.toString())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
