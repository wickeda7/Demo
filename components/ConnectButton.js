import React, { useEffect, useContext } from 'react'
import { ConnectButton } from 'web3uikit';
import { useMoralis } from 'react-moralis';
import { DemoContext } from '../context/context'; 

const ConnectButton2 = () => {    
    
    return ( <div> <ConnectButton moralisAuth={false}/> </div> );
};

export default ConnectButton2;