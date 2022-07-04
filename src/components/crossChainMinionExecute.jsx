import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Icon, Link, Spinner } from '@chakra-ui/react';
import { Text } from '@chakra-ui/layout';
import { RiCheckboxCircleLine, RiExternalLinkLine } from 'react-icons/ri';

import TextBox from './TextBox';
import { chainByID } from '../utils/chain';
import { BRIDGE_MODULES, getNomadTxStatus } from '../utils/gnosis';

const AMBExecute = ({ chainID, proposal }) => {
  const monitoringAppUrl =
    proposal.minion.crossChainMinion &&
    chainByID(chainID).zodiac_amb_module?.monitoring_app[
      proposal.minion.foreignChainId
    ];
  return (
    <Flex alignItems='center' flexDir='column'>
      <Box mb={2}>Executed</Box>
      {monitoringAppUrl && proposal.minionExecuteActionTx?.id && (
        <Link
          href={`${monitoringAppUrl}/${proposal.minionExecuteActionTx.id}`}
          isExternal
        >
          <Button>Watch Cross-Chain Tx</Button>
        </Link>
      )}
    </Flex>
  );
};

const NomadExecute = ({ chainID, proposal }) => {
  const POLL = 60000 * 5;
  const [status, setStatus] = useState();

  const foreignChainConfig = chainByID(proposal.minion.foreignChainId);
  const homeChainConfig = chainByID(chainID);

  useEffect(() => {
    const homeChainId = chainID;
    const { foreignChainId } = proposal.minion;
    const txHash = proposal.minionExecuteActionTx?.id;
    const getNomadStatus = async () => {
      // { statusMsg, stage, txHash }
      const currentStatus = await getNomadTxStatus({
        homeChainId,
        foreignChainId,
        txHash,
      });
      if (currentStatus?.statusMsg !== 'Processed') {
        setTimeout(getNomadStatus, POLL);
      }
      setStatus(currentStatus);
    };
    if (txHash) {
      // setTimeout(getNomadStatus, POLL);
      getNomadStatus();
    }
  }, [proposal]);

  return (
    <Flex alignItems='center' flexDir='column'>
      <TextBox mb={4}>Nomad Tx Status</TextBox>
      {!status || status.statusMsg !== 'Processed' ? (
        <Spinner />
      ) : (
        <RiCheckboxCircleLine
          style={{
            width: '50px',
            height: '50px',
            color: 'green',
          }}
          mb={3}
        />
      )}
      {status ? (
        <Box>
          <Text>
            {status.statusMsg} at {status.stage}
          </Text>
          <Flex alignItems='center' flexDir='column'>
            {status.txHash && (
              <Link
                href={`${
                  status.stage === 'Home'
                    ? homeChainConfig.block_explorer
                    : foreignChainConfig.block_explorer
                }/tx/${status.txHash}`}
                isExternal
              >
                <Icon
                  as={RiExternalLinkLine}
                  name='explorer link'
                  color='secondary.300'
                  _hover={{ cursor: 'pointer' }}
                />
              </Link>
            )}
            <Text>Stage Tx</Text>
          </Flex>
        </Box>
      ) : (
        <Text>Fetching Tx Info...</Text>
      )}
    </Flex>
  );
};

const CrossChainMinionExecute = ({ chainID, proposal }) => {
  const { bridgeModule } = proposal.minion;

  if (bridgeModule === BRIDGE_MODULES.AMB_MODULE)
    return <AMBExecute chainID={chainID} proposal={proposal} />;
  if (bridgeModule === BRIDGE_MODULES.NOMAD_MODULE)
    return <NomadExecute chainID={chainID} proposal={proposal} />;
  return null;
};

export default CrossChainMinionExecute;
