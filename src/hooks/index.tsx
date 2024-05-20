import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { echo, type Echo } from "@libp2p/echo";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { identify, type Identify } from "@chainsafe/libp2p-identify";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { pipe } from "it-pipe";
import { createLibp2p, type Libp2p } from "libp2p";
import type { Multiaddr } from "@multiformats/multiaddr";
import delay from "delay";
import { createResource } from "solid-js";
import { createStore } from "solid-js/store";
import { type PeerId } from "@libp2p/interface";
import { multiaddr } from "@multiformats/multiaddr";
import { logger } from "@libp2p/logger";

type P2PNode = Libp2p<{
  identify: Identify;
  echo: Echo;
}>;

type P2PState = {
  node?: P2PNode;
  relayAddr: Multiaddr | Multiaddr[] | PeerId;
  peerAddr: Multiaddr | Multiaddr[] | PeerId;
};

const log = logger("libp2p:app");

const initNode = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ["/webrtc"],
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
    start: false,
  });

  node.addEventListener("peer:connect", (event) => {
    log("peer:connect");
    log(event.detail);
  });
  node.addEventListener("connection:open", (event) => {
    log("connection:open");
    log(event.detail);
  });
  node.addEventListener("self:peer:update", (event) => {
    log("self:peer:update");
    log(event.detail);
    log(event.detail.peer);
  });
  node.addEventListener("transport:listening", (event) => {
    log("transport:listening");
    console.log(event.detail.getAddrs());
  });
  node.addEventListener("start", (event) => {
    log("start");
    log(event.detail.getMultiaddrs());
  });

  await node.start();

  return node;
};

export const useP2P = () => {
  const initialState: P2PState = {
    node: undefined,
    relayAddr: [
      multiaddr(
        "/dns4/localhost/tcp/443/wss/p2p/12D3KooWCszKJJSYCbmwZyGCFcF7Em3SL8CocW69DueascKrn8H2"
      ),
    ],
    peerAddr: [],
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

    await node.dial(relayAddr, {
      signal: AbortSignal.timeout(5000),
    });

    while (true) {
      const addresses = node.getMultiaddrs();
      if (addresses && addresses.length > 0) {
        return addresses;
      }
      await delay(1000);
    }
  });
  const dialPeerResource = createResource(async () => {
    const { node, peerAddr } = state;

    const stream = await node.dialProtocol(
      peerAddr,
      node.services.echo.protocol,
      {
        signal: AbortSignal.timeout(10_000),
      }
    );

    await pipe(
      [new TextEncoder().encode("hello world")],
      stream,
      async function (source) {
        for await (const buf of source) {
          console.info(new TextDecoder().decode(buf.subarray()));
        }
      }
    );
  });
  return {
    state,
    setState,
    nodeResource,
    dialRelayResource,
    dialPeerResource,
  };
};
