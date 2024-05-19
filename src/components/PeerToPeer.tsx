import { For, Match, Switch } from "solid-js";
import { useP2P } from "../hooks";
import { multiaddr } from "@multiformats/multiaddr";

const PeerToPeer = () => {
  const {
    state: { relayAddr, peerAddr },
    setState,
    nodeResource: [nodeData, { refetch: initNode }],
    dialRelayResource: [relayData, { refetch: dialRelay }],
    dialPeerResource: [peerData, { refetch: dialPeer }],
  } = useP2P();

  return (
    <div>
      <div class="controls">
        <div>
          <label>Start</label>
          <button
            aria-label="Start"
            onclick={() => {
              initNode();
            }}
          >
            🛜
          </button>
          {nodeData.loading && <span>Loading...</span>}
          <Switch fallback={<div>Node not have state</div>}>
            <Match when={nodeData.state === "unresolved"}>Unresolved</Match>
            <Match when={nodeData.state === "pending"}>Pending</Match>
            <Match when={nodeData.state === "refreshing"}>Refreshing</Match>
            <Match when={nodeData.state === "ready"}>Ready</Match>
            <Match when={nodeData.state === "errored"}>Error</Match>
          </Switch>
        </div>
        <div>
          <label>Relay</label>
          <input
            type="text"
            value={relayAddr.toString()}
            onInput={(e) => setState("relayAddr", multiaddr(e.target.value))}
          />
          <button aria-label="Scan">🔍</button>
          <button
            aria-label="Call"
            onclick={() => {
              dialRelay();
            }}
          >
            📞
          </button>
          <Switch fallback={<div>Not dail state</div>}>
            <Match when={relayData.state === "unresolved"}>Unresolved</Match>
            <Match when={relayData.state === "pending"}>Pending</Match>
            <Match when={relayData.state === "refreshing"}>Refreshing</Match>
            <Match when={relayData.state === "ready"}>Ready</Match>
            <Match when={relayData.state === "errored"}>Error</Match>
          </Switch>
        </div>
        <div>
          <label>Dial</label>
          <input
            type="text"
            value={peerAddr.toString()}
            onInput={(e) => setState("peerAddr", multiaddr(e.target.value))}
          />
          <button aria-label="Scan">🔍</button>
          <button
            aria-label="Call"
            onclick={() => {
              dialPeer();
            }}
          >
            📞
          </button>
          <Switch fallback={<div>Not dail state</div>}>
            <Match when={peerData.state === "unresolved"}>Unresolved</Match>
            <Match when={peerData.state === "pending"}>Pending</Match>
            <Match when={peerData.state === "refreshing"}>Refreshing</Match>
            <Match when={peerData.state === "ready"}>Ready</Match>
            <Match when={peerData.state === "errored"}>Error</Match>
          </Switch>
        </div>
      </div>

      <div>
        My addresses:
        <For each={relayData()} fallback={<div>Getting addresses...</div>}>
          {(item) => <div>{item.toString()}</div>}
        </For>
      </div>
      <div id="errors">Errors node: "{nodeData.error}"</div>
      <div id="errors">Errors dial relay: "{relayData.error}"</div>
      <div id="errors">Errors dial peer: "{peerData.error}"</div>
    </div>
  );
};

export default PeerToPeer;
