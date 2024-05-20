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
    <div class="container mx-auto mt-4">
      <div class="controls">
        <div class="mb-2 grid grid-cols-12 gap-1 justify-center items-center">
          <div class="col-span-2">Relay Server</div>
          <label class="col-span-8 input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="w-4 h-4 opacity-70"
            >
              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
              <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
            </svg>
            <input
              type="text"
              class="grow"
              value={relayAddr.toString()}
              onInput={(e) => setState("relayAddr", multiaddr(e.target.value))}
            />
          </label>
          <button
            class="btn col-span-2"
            aria-label="Call"
            onclick={() => {
              dialRelay();
            }}
          >
            📞
            <span class="ml-1">
              <Switch fallback={<div>Not dail state</div>}>
                <Match when={relayData.state === "unresolved"}>
                  Unresolved
                </Match>
                <Match when={relayData.state === "pending"}>Pending</Match>
                <Match when={relayData.state === "refreshing"}>
                  Refreshing
                </Match>
                <Match when={relayData.state === "ready"}>Ready</Match>
                <Match when={relayData.state === "errored"}>Error</Match>
              </Switch>
            </span>
          </button>
        </div>
        <div class="mb-2 grid grid-cols-12 gap-1 justify-center items-center">
          <div class="col-span-2">Peer</div>
          <label class="col-span-8 input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="w-4 h-4 opacity-70"
            >
              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
              <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
            </svg>
            <input
              class="grow"
              type="text"
              value={peerAddr.toString()}
              onInput={(e) => setState("peerAddr", multiaddr(e.target.value))}
            />
          </label>
          <button
            class="btn col-span-2"
            aria-label="Call"
            onclick={() => {
              dialPeer();
            }}
          >
            📞
            <span class="ml-1">
              <Switch fallback={<div>Not dail state</div>}>
                <Match when={peerData.state === "unresolved"}>Unresolved</Match>
                <Match when={peerData.state === "pending"}>Pending</Match>
                <Match when={peerData.state === "refreshing"}>Refreshing</Match>
                <Match when={peerData.state === "ready"}>Ready</Match>
                <Match when={peerData.state === "errored"}>Error</Match>
              </Switch>
            </span>
          </button>
        </div>
      </div>
      <div class="mb-2">
        <button
          type="button"
          class="btn"
          onclick={() => {
            const debug = localStorage.getItem("debug");
            if (debug && debug !== "") {
              localStorage.removeItem("debug");
            } else {
              localStorage.setItem("debug", "*libp2p:*");
            }
          }}
        >
          Tooggle Logs
        </button>
      </div>
      <div>
        My addresses:
        <For each={relayData()}>
          {(item) => {
            return (
              <div class="max-w-full p-2 overflow-auto break-words text-wrap outline-dashed mb-1">
                {item.toString()}
              </div>
            );
          }}
        </For>
      </div>
      <div class="mb-2">
        <div id="errors">Errors node: "{nodeData.error}"</div>
        <div id="errors">Errors dial relay: "{relayData.error}"</div>
        <div id="errors">Errors dial peer: "{peerData.error}"</div>
      </div>

      <div>
        <button
          class="btn"
          aria-label="Start"
          onclick={() => {
            initNode();
          }}
        >
          <span class="mr-1">▶️ Start Node</span>

          <span class="badge badge-info">
            {nodeData.loading && <span>Loading...</span>}
            <Switch fallback={<div>Node not have state</div>}>
              <Match when={nodeData.state === "unresolved"}>Unresolved</Match>
              <Match when={nodeData.state === "pending"}>Pending</Match>
              <Match when={nodeData.state === "refreshing"}>Refreshing</Match>
              <Match when={nodeData.state === "ready"}>Ready</Match>
              <Match when={nodeData.state === "errored"}>Error</Match>
            </Switch>
          </span>
        </button>
      </div>
    </div>
  );
};

export default PeerToPeer;
