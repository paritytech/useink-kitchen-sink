/* eslint-disable @next/next/no-img-element */
import {
  decodeError,
  isBroadcasting,
  isFinalized,
  isInBlock,
  isPendingSignature,
  shouldDisable,
  useBalance,
  useBlockHeader,
  useBlockHeaders,
  useCall,
  useCallSubscription,
  useChainRpc,
  useChainRpcList,
  useContract,
  useDryRun,
  useInstalledWallets,
  useTx,
  useTxPaymentInfo,
  useUninstalledWallets,
  useWallet,
} from 'useink';
import metadata from '../../metadata/playground.json';
import { ChainId } from 'useink/chains';
import { useEffect, useMemo } from 'react';
import { useNotifications } from 'useink/notifications';
import { Notifications } from '../Notifications';

const CONTRACTS_ROCOCO_ADDRESS = '5HiKMysYx7npX4cngjvdkygKaPgJYirPh9UG1cJpBssayxys';
const SHIBUYA_CONTRACT_ADDRESS = 'Z91HMz88MfDjY4uKzAbcYvXeAHjwJWTLNzt52eHCNjotpMS';

type MoodResult = { Ok?: { mood: string }; Err?: { BadMood: { mood: string } } };

export const HomePage: React.FC = () => {
  const { account, accounts, setAccount, connect, disconnect } = useWallet();
  const block = useBlockHeader(); // with no arguments it defaults to the first item in the chains config
  const astarBlockNumber = useBlockHeader('astar');
  const allChainBlockHeaders = useBlockHeaders();
  const balance = useBalance(account);
  const cRococoContract = useContract(CONTRACTS_ROCOCO_ADDRESS, metadata);
  const { rpcs, setChainRpc } = useChainRpcList('astar');
  const astarRpc = useChainRpc('astar');
  const get = useCall<boolean>(cRococoContract?.contract, 'get');
  const getSubcription = useCallSubscription<boolean>(cRococoContract, 'get');
  const flipTx = useTx<void>(cRococoContract?.contract, 'flip');
  const flipDryRun = useDryRun(cRococoContract?.contract, 'flip');
  const flipPaymentInfo = useTxPaymentInfo(cRococoContract?.contract, 'flip');
  const panic = useCall<boolean>(cRococoContract?.contract, 'panic');
  const assertBoom = useCall<boolean>(cRococoContract?.contract, 'assertBoom');
  const mood = useCall<MoodResult>(cRococoContract?.contract, 'mood');
  const shibuyaContract = useContract(SHIBUYA_CONTRACT_ADDRESS, metadata, 'shibuya-testnet');
  const shibuyaFlipTx = useTx(shibuyaContract?.contract, 'flip');
  const shibuyaGetSubcription = useCallSubscription<boolean>(shibuyaContract, 'get');
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isPendingSignature(flipTx)) {
      addNotification({ type: flipTx.status, message: `Please sign the transaction in your wallet` });
    }

    if (isBroadcasting(flipTx)) {
      addNotification({
        type: flipTx.status,
        message: 'Flip transaction has been broadcast!',
      });
    }

    if (isInBlock(flipTx)) {
      addNotification({
        type: flipTx.status,
        message: 'Transaction is in the block.',
      });
    }

    if (isFinalized(flipTx)) {
      addNotification({ type: flipTx.status, message: `The transaction has been finalized.` });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipTx.status]);

  useEffect(() => {
    account &&
      addNotification({
        type: 'WalletConnected',
        message: `Connected to ${account.name || account.address}`,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const installedWallets = useInstalledWallets();
  const uninstalledWallets = useUninstalledWallets();

  if (!cRococoContract?.contract) {
    return (
      <div className="justify-center h-screen flex items-center w-full">
        <h1 className="text-3xl font-bold">Loading contract...</h1>
      </div>
    );
  }

  return (
    <section className="w-full mx-auto">
      <Notifications />
      <div className="max-w-3xl w-full mx-auto py-16 px-4">
        <h1 className="text-5xl font-bold text-blue-500">useink Kitchen Sink</h1>
        <h2 className="text-2xl text-blue-500 mb-16">
          See the contract definitions{' '}
          <a
            className="underline hover:opacity-80 transition duration-75"
            href="https://github.com/paritytech/useink-kitchen-sink/blob/master/lib.rs"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </h2>

        <div className="mt-8">
          {!account ? (
            <ul className="flex flex-col gap-4">
              {installedWallets.length > 0 ? (
                <>
                  <h2 className="text-xl font-bold">Connect a Wallet</h2>
                  <h3 className="text-md">Installed Wallets</h3>
                  {installedWallets.map((w) => (
                    <li key={w.title}>
                      <button
                        onClick={() => connect(w.extensionName)}
                        className="flex items-center w-full rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 transition duration-75"
                      >
                        <img className="w-12 mr-2" src={w.logo.src} alt={w.logo.alt} />
                        Connect to {w.title}
                      </button>
                    </li>
                  ))}
                </>
              ) : (
                <h2 className="text-xl font-bold">You don&apos;t have any wallets installed...</h2>
              )}

              {uninstalledWallets.length > 0 && (
                <>
                  <h3 className="text-md">Uninstalled Wallets</h3>

                  {uninstalledWallets.map((w) => (
                    <li key={w.title}>
                      <a
                        href={w.installUrl}
                        target="_blank"
                        className="flex items-center w-full rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 transition duration-75"
                      >
                        <img className="w-12 mr-2" src={w.logo.src} alt={w.logo.alt} />
                        Install {w.title}
                      </a>
                    </li>
                  ))}
                </>
              )}
            </ul>
          ) : (
            <ul className="list-none flex flex-col gap-12">
              <li>
                <button
                  onClick={disconnect}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 transition duration-75"
                >
                  Disconnect
                </button>
              </li>

              <li>
                <b>You are connected as:</b>
                <span className="ml-4 dark:bg-slate-600 bg-slate-200 rounded-lg py-2 px-2">
                  {account.name || account.address}
                </span>
              </li>

              {accounts?.map(
                (acc) =>
                  account !== acc && (
                    <li key={acc.address} className="flex flex-col">
                      <b>Connect to {acc.name ? acc.name : 'another wallet'}</b>
                      <button
                        onClick={() => setAccount(acc)}
                        className="rounded-2xl text-white px-4 py-2 mt-2 bg-blue-500 hover:bg-blue-600 transition duration-75"
                      >
                        {acc.address}
                      </button>
                    </li>
                  ),
              )}

              <li>
                <b>Your Free Balance:</b>
                <span className="ml-4 dark:bg-slate-600 bg-slate-200 rounded-lg py-2 px-2">
                  {balance?.freeBalance.toString()}
                </span>
              </li>

              <li>
                <b>Contracts Rococo Current Block:</b>
                <span className="ml-4 dark:bg-slate-600 bg-slate-200 rounded-lg py-2 px-2">
                  {block?.blockNumber === undefined ? '--' : block.blockNumber}
                </span>
              </li>

              <li>
                <b>Astar Current Block:</b>
                <span className="ml-4 dark:bg-slate-600 bg-slate-200 rounded-lg py-2 px-2">
                  {astarBlockNumber?.blockNumber === undefined ? '--' : astarBlockNumber.blockNumber}
                </span>
              </li>

              <li>
                <b>Change a chain&apos;s active RPC url: (e.g. Astar)</b>
                <ul className="px-0 m-0 mt-6 gap-4 grid grid-cols-2 items-center">
                  {rpcs.map((rpc) => (
                    <li key={rpc} className="p-0">
                      <button
                        className="rounded-2xl w-full text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                        disabled={rpc === astarRpc}
                        onClick={() => setChainRpc(rpc, 'astar')}
                      >
                        {rpc}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <b>
                  Get all blocks from configured chains using:{' '}
                  <code className="p-2 rounded-md bg-slate-500">useBlockHeaders()</code>
                </b>
                <ul className="px-0 m-0 mt-6 gap-4 flex items-center flex-col md:flex-row">
                  {(Object.keys(allChainBlockHeaders) as ChainId[]).map((chainId) => (
                    <li key={chainId} className="p-0">
                      <span>
                        <b>{chainId}:</b> {allChainBlockHeaders[chainId]?.blockNumber || '--'}{' '}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>

              <li className="flex items-center gap-4">
                <button
                  onClick={() => get.send()}
                  disabled={get.isSubmitting}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  Call get()
                </button>

                <h3 className="text-xl">Value: {get.result?.ok ? get.result.value.decoded.toString() : '--'}</h3>
              </li>

              <li className="flex items-center gap-4">
                <h3 className="text-xl">
                  get() will update on new blocks:{' '}
                  {getSubcription.result?.ok ? getSubcription.result.value.decoded.toString() : '--'}
                </h3>
              </li>

              <li className="flex flex-col gap-4">
                <button
                  onClick={() => flipTx.signAndSend()}
                  disabled={shouldDisable(flipTx)}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  {shouldDisable(flipTx) ? 'Flipping' : 'Flip!'}
                </button>

                <h3 className="text-xl">
                  <b>Status:</b> {flipTx.status}
                </h3>

                <button
                  onClick={() => flipTx.resetState()}
                  disabled={shouldDisable(flipTx) || ['InBlock', 'None'].includes(flipTx.status)}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  Reset state
                </button>
              </li>

              <li className="flex flex-col gap-4">
                <h3 className="text-xl">Call a contract on another chain. e.g. &quot;Shibuya&quot;</h3>

                <h3 className="text-xl">
                  Shibuya Flipped:{' '}
                  {shibuyaGetSubcription.result?.ok ? shibuyaGetSubcription.result.value.decoded.toString() : '--'}
                </h3>

                <button
                  onClick={() => shibuyaFlipTx.signAndSend()}
                  disabled={shouldDisable(shibuyaFlipTx)}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  {shouldDisable(shibuyaFlipTx) ? 'Flipping Shibuya Contract' : 'Flip Shibuya Contract!'}
                </button>

                <h3 className="text-xl">
                  <b>Status:</b> {shibuyaFlipTx.status}
                </h3>

                <button
                  onClick={() => shibuyaFlipTx.resetState()}
                  disabled={shouldDisable(shibuyaFlipTx) || ['InBlock', 'None'].includes(shibuyaFlipTx.status)}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  Reset state
                </button>
              </li>

              <li className="flex flex-col gap-4">
                <button
                  onClick={() => flipDryRun.send()}
                  disabled={flipDryRun.isSubmitting}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  {flipDryRun.isSubmitting ? 'Flipping' : 'Flip as Dry Run!'}
                </button>

                <h3 className="text-xl">
                  <b>Gas Required:</b>{' '}
                  {flipDryRun.result?.ok
                    ? flipDryRun.result.value.partialFee.toString()
                    : (flipDryRun.result?.error && decodeError(flipDryRun.result, cRococoContract.contract).message) ||
                      '--'}
                </h3>
              </li>

              <li className="flex flex-col gap-4">
                <button
                  onClick={() => flipPaymentInfo.send()}
                  disabled={flipPaymentInfo.isSubmitting}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  {flipPaymentInfo.isSubmitting ? 'Getting payment info...' : 'Get payment info for flip'}
                </button>

                <h3 className="text-xl">
                  <b>Partial Fee (a.k.a. Gas Required):</b>{' '}
                  {flipPaymentInfo.result ? flipPaymentInfo.result?.partialFee.toString() : '--'}
                </h3>
              </li>

              <li className="flex flex-col gap-4">
                <button
                  onClick={() => panic.send()}
                  disabled={panic.isSubmitting}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  Call panic()
                </button>

                <h3 className="text-xl">
                  {panic.result && !panic.result.ok
                    ? decodeError(panic.result, cRococoContract.contract, {
                        ContractTrapped: 'This is a custom message. There was a panic in the contract!',
                      }).message
                    : '--'}
                </h3>
              </li>

              <li className="flex flex-col gap-4">
                <button
                  onClick={() => assertBoom.send()}
                  disabled={assertBoom.isSubmitting}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  Call assertBoom()
                </button>

                <h3 className="text-xl">
                  {assertBoom.result && !assertBoom.result.ok
                    ? decodeError(assertBoom.result, cRococoContract.contract, {
                        ContractTrapped: 'This is a custom message. The assertion failed!',
                      }).message
                    : '--'}
                </h3>
              </li>

              <li className="flex flex-col gap-4">
                <h3 className="text-xl">
                  Handle Results. An even number will return an Ok Result, and an odd number will return an Error
                </h3>
                <button
                  onClick={() => mood.send([0])}
                  disabled={mood.isSubmitting}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  {mood.isSubmitting ? 'Getting mood...' : 'Get Ok Result'}
                </button>

                <button
                  onClick={() => mood.send([1])}
                  disabled={mood.isSubmitting}
                  className="rounded-2xl text-white px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 hover:disabled:bg-blue-300 transition duration-75"
                >
                  {mood.isSubmitting ? 'Getting mood...' : 'Get Err Result'}
                </button>

                <h3 className="text-xl">
                  Mood:{' '}
                  {mood.result?.ok
                    ? mood.result.value?.decoded.Ok
                      ? mood.result.value.decoded.Ok.mood
                      : mood.result.value.decoded.Err?.BadMood.mood
                    : '--'}
                </h3>
              </li>
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
