import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { echo, type Echo } from '@libp2p/echo';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { identify, type Identify } from '@chainsafe/libp2p-identify';
import { webRTC, webRTCDirect } from '@libp2p/webrtc';
import { webSockets } from '@libp2p/websockets';
import * as filters from '@libp2p/websockets/filters';
import { WebRTC } from '@multiformats/multiaddr-matcher';
import { pipe } from 'it-pipe';
import { createLibp2p, type Libp2p } from 'libp2p';
import type { Multiaddr } from '@multiformats/multiaddr';
import delay from 'delay';
import { createResource } from 'solid-js';
import { createStore } from 'solid-js/store';
import { type PeerId } from '@libp2p/interface';
import { multiaddr } from '@multiformats/multiaddr';

type P2PNode = Libp2p<{
  identify: Identify;
  echo: Echo;
}>;

type P2PState = {
  node?: P2PNode;
  relayAddr: Multiaddr | Multiaddr[] | PeerId;
};

const initNode = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ['/webrtc'],
    },
    transports: [
      webSockets({ filter: filters.all }),
      webRTC(),
      circuitRelayTransport({
        discoverRelays: 1,
      }),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    services: {
      identify: identify(),
      echo: echo(),
    },
  });

  await node.start();
  return node;
};

export const useP2P = () => {
  const initialState: P2PState = {
    node: undefined,
    relayAddr: [multiaddr('/ip4/4.227.145.88/tcp/8080/')],
  };
  const [state, setState] = createStore(initialState);

  const nodeResource = createResource(async () => {
    const node = await initNode();
    setState({ node });

    return node;
  });

  const dialRelayResource = createResource(async () => {
    const { node, relayAddr } = state;

    if (!node) return;
    try {
      await node.dial(relayAddr, {
        signal: AbortSignal.timeout(5000),
      });
    } catch (e) {
      console.error(e);
      throw e;
    }

    while (true) {
      const webRTCMultiaddr = node
        .getMultiaddrs()
        .find((ma) => WebRTC.matches(ma));

      if (webRTCMultiaddr !== undefined) {
        return webRTCMultiaddr;
      }
      await delay(1000);
    }
  });

  return {
    state,
    setState,
    nodeResource,
    dialRelayResource,
  };
};

//   await pipe(outgoingQueue, stream, async (source) => {
//     for await (const buf of source) {
//       console.info(new TextDecoder().decode(buf.subarray()));
//     }
//   });
// }