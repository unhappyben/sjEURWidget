# sjEURWidget

Scriptable widget for Jarvis Network's sjEUR token. 

## Features

- Displays sjEUR balance from your wallet
- Shows underlying EUR value
- Displays current ratio between total assets and total supply
- Updates automatically with refresh timestamp

## Prerequisites

1. iOS device with [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) app installed
2. sjEUR tokens on Base network
3. Active wallet address

## Installation

1. Download and install Scriptable from the App Store
2. Create a new script in Scriptable
3. Copy the entire script content into your new script
4. Configure the constants at the top of the script

## Configuration

Update the following constants in the script:
const WALLET_ADDRESS = ""

## Widget

The widget displays:
- "Balance" header with logo
- sjEUR balance in large text
- EUR value and current ratio
- Last refresh timestamp

## Usage

1. Configure the script with your wallet address
2. Run the script once in the Scriptable app to verify it works
3. Add a new Scriptable widget to your home screen
4. Select the script and choose small widget size
5. The widget will automatically update periodically

## Error Handling

The widget includes error handling for:
- RPC call failures
- Invalid responses
- Network issues
- Image loading problems

Created by [unhappyben](https://x.com/unhappyben?s=21&t=FH-9u6WGNvfYM1jwqkMgmQ)