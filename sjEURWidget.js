// Constants
const WALLET_ADDRESS = "" //replace with wallet address 
const sjEUR_CONTRACT = "0x89Cc2A57223fa803852b6B4E65c6E376D49909f9"
const RPC_ENDPOINT = "https://mainnet.base.org"
const TEXT_COLOR = new Color("#000000")
const LOGO_URL = "https://i.ibb.co/qSYLkzL/IMG-4360.png"
const BACKGROUND_COLOR = new Color("#FFFFFF")
const LAST_REFRESH_FILE = "lastRefreshTime_base.txt"

// Contract function signatures
const TOTAL_ASSETS_SIG = "0x01e1d114" // totalAssets()
const TOTAL_SUPPLY_SIG = "0x18160ddd" // totalSupply()
const BALANCE_OF_SIG = "0x70a08231" // balanceOf(address)

// Font selection
function getFont(size, weight = "regular") {
  return new Font("Simula", size)
}

// File operations for last refresh time
function saveLastRefreshTime() {
  const fm = FileManager.local()
  const path = fm.joinPath(fm.documentsDirectory(), LAST_REFRESH_FILE)
  fm.writeString(path, new Date().toISOString())
}

function getLastRefreshTime() {
  const fm = FileManager.local()
  const path = fm.joinPath(fm.documentsDirectory(), LAST_REFRESH_FILE)
  if (fm.fileExists(path)) {
    const dateString = fm.readString(path)
    return new Date(dateString)
  }
  return null
}

// Enhanced RPC calls
async function makeRPCCall(data) {
  const req = new Request(RPC_ENDPOINT)
  req.method = "POST"
  req.headers = { "Content-Type": "application/json" }
  req.body = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{
      to: sjEUR_CONTRACT,
      data: data
    }, "latest"],
    id: 1
  })

  try {
    const response = await req.loadJSON()
    if (response.error) {
      console.error("RPC Error:", response.error)
      return null
    }
    return response.result
  } catch (error) {
    console.error("Error in RPC call:", error)
    return null
  }
}

async function getContractValues() {
  // Get all required values
  const balanceData = `${BALANCE_OF_SIG}000000000000000000000000${WALLET_ADDRESS.slice(2)}`
  const [totalAssetsHex, totalSupplyHex, balanceHex] = await Promise.all([
    makeRPCCall(TOTAL_ASSETS_SIG),
    makeRPCCall(TOTAL_SUPPLY_SIG),
    makeRPCCall(balanceData)
  ])

  if (!totalAssetsHex || !totalSupplyHex || !balanceHex) {
    return { sjeurBalance: "Error", eurValue: "Error", ratio: "Error" }
  }

  const totalAssets = parseInt(totalAssetsHex, 16)
  const totalSupply = parseInt(totalSupplyHex, 16)
  const balance = parseInt(balanceHex, 16)

  // Calculate ratio and values
  const ratio = totalSupply > 0 ? totalAssets / totalSupply : 0
  const sjeurBalance = balance / 1e18
  const eurValue = sjeurBalance * ratio

  return {
    sjeurBalance: sjeurBalance.toFixed(2),
    eurValue: eurValue.toFixed(2),
    ratio: ratio.toFixed(4)
  }
}

// Utility functions
const getShortAddress = address => `${address.slice(0, 6)}...${address.slice(-4)}`

function getTimestamp() {
  const lastRefreshTime = getLastRefreshTime()
  if (!lastRefreshTime) return "N/A"
  
  const now = new Date()
  const diff = Math.floor((now - lastRefreshTime) / 1000 / 60)
  return diff < 1 ? "now" : `${diff}m ago`
}

// Create and configure widget
async function createWidget() {
  const widget = new ListWidget()
  widget.backgroundColor = BACKGROUND_COLOR
  
  addTopStack(widget)
  widget.addSpacer(20)
  await addBalanceStack(widget)
  widget.addSpacer(4)
  await addRatioStack(widget)
  widget.addSpacer(4)
  addBottomTexts(widget)
  
  return widget
}

function addTopStack(widget) {
  const topStack = widget.addStack()
  topStack.layoutHorizontally()
  
  const balanceText = topStack.addText("Balance")
  balanceText.textColor = TEXT_COLOR
  balanceText.font = getFont(16)
  
  topStack.addSpacer()
  addLogo(topStack)
}

function addLogo(stack) {
  stack.addImage(logoImage).imageSize = new Size(30, 30)
}

async function addBalanceStack(widget) {
  const balanceStack = widget.addStack()
  balanceStack.layoutHorizontally()
  balanceStack.centerAlignContent()
  balanceStack.spacing = 2
  
  const { sjeurBalance } = await getContractValues()
  const balanceAmountText = balanceStack.addText(sjeurBalance)
  balanceAmountText.textColor = TEXT_COLOR
  balanceAmountText.font = getFont(24, "bold")
  
  const sjeurText = balanceStack.addText(" sjEUR")
  sjeurText.textColor = TEXT_COLOR
  sjeurText.font = getFont(14)
  sjeurText.lineLimit = 1
}

async function addRatioStack(widget) {
  const ratioStack = widget.addStack()
  ratioStack.layoutHorizontally()
  ratioStack.centerAlignContent()
  ratioStack.spacing = 4
  
  const { eurValue, ratio } = await getContractValues()
  
  const eurValueText = ratioStack.addText(`${eurValue} EUR`)
  eurValueText.textColor = TEXT_COLOR
  eurValueText.font = getFont(12)
  
  const pipeText = ratioStack.addText(" | ")
  pipeText.textColor = TEXT_COLOR
  pipeText.font = getFont(12)
  
  const ratioValueText = ratioStack.addText(ratio)
  ratioValueText.textColor = TEXT_COLOR
  ratioValueText.font = getFont(12)
}

function addBottomTexts(widget) {
  const addressText = widget.addText(getShortAddress(WALLET_ADDRESS))
  addressText.textColor = TEXT_COLOR
  addressText.font = getFont(10)
  
  const timestampText = widget.addText(getTimestamp())
  timestampText.textColor = TEXT_COLOR
  timestampText.font = getFont(10)
}

// Main execution
let logoImage
async function main() {
  try {
    logoImage = await new Request(LOGO_URL).loadImage()
  } catch (error) {
    console.error("Error loading logo:", error)
    logoImage = null
  }

  const widget = await createWidget()
  
  if (config.runsInWidget) {
    Script.setWidget(widget)
  } else {
    widget.presentSmall()
  }
  
  saveLastRefreshTime()
}

await main()
Script.complete()