"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfuraProvider = exports.InfuraWebSocketProvider = void 0;
const index_js_1 = require("../utils/index.js");
const community_js_1 = require("./community.js");
const network_js_1 = require("./network.js");
const provider_jsonrpc_js_1 = require("./provider-jsonrpc.js");
const provider_websocket_js_1 = require("./provider-websocket.js");
const defaultProjectId = "84842078b09946638c03157f83405213";
function getHost(name) {
    switch (name) {
        case "mainnet":
            return "mainnet.infura.io";
        case "goerli":
            return "goerli.infura.io";
        case "sepolia":
            return "sepolia.infura.io";
        case "arbitrum":
            return "arbitrum-mainnet.infura.io";
        case "arbitrum-goerli":
            return "arbitrum-goerli.infura.io";
        case "matic":
            return "polygon-mainnet.infura.io";
        case "maticmum":
            return "polygon-mumbai.infura.io";
        case "optimism":
            return "optimism-mainnet.infura.io";
        case "optimism-goerli":
            return "optimism-goerli.infura.io";
    }
    return (0, index_js_1.throwArgumentError)("unsupported network", "network", name);
}
class InfuraWebSocketProvider extends provider_websocket_js_1.WebSocketProvider {
    projectId;
    projectSecret;
    constructor(network, apiKey) {
        const provider = new InfuraProvider(network, apiKey);
        const req = provider._getConnection();
        if (req.credentials) {
            (0, index_js_1.throwError)("INFURA WebSocket project secrets unsupported", "UNSUPPORTED_OPERATION", {
                operation: "InfuraProvider.getWebSocketProvider()"
            });
        }
        const url = req.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
        super(url, network);
        (0, index_js_1.defineProperties)(this, {
            projectId: provider.projectId,
            projectSecret: provider.projectSecret
        });
    }
    isCommunityResource() {
        return (this.projectId === defaultProjectId);
    }
}
exports.InfuraWebSocketProvider = InfuraWebSocketProvider;
class InfuraProvider extends provider_jsonrpc_js_1.JsonRpcProvider {
    projectId;
    projectSecret;
    constructor(_network = "mainnet", projectId, projectSecret) {
        const network = network_js_1.Network.from(_network);
        if (projectId == null) {
            projectId = defaultProjectId;
        }
        if (projectSecret == null) {
            projectSecret = null;
        }
        const request = InfuraProvider.getRequest(network, projectId, projectSecret);
        super(request, network, { staticNetwork: network });
        (0, index_js_1.defineProperties)(this, { projectId, projectSecret });
    }
    _getProvider(chainId) {
        try {
            return new InfuraProvider(chainId, this.projectId, this.projectSecret);
        }
        catch (error) { }
        return super._getProvider(chainId);
    }
    isCommunityResource() {
        return (this.projectId === defaultProjectId);
    }
    static getWebSocketProvider(network, apiKey) {
        return new InfuraWebSocketProvider(network, apiKey);
    }
    static getRequest(network, projectId, projectSecret) {
        if (projectId == null) {
            projectId = defaultProjectId;
        }
        if (projectSecret == null) {
            projectSecret = null;
        }
        const request = new index_js_1.FetchRequest(`https:/\/${getHost(network.name)}/v3/${projectId}`);
        request.allowGzip = true;
        if (projectSecret) {
            request.setCredentials("", projectSecret);
        }
        if (projectId === defaultProjectId) {
            request.retryFunc = async (request, response, attempt) => {
                (0, community_js_1.showThrottleMessage)("InfuraProvider");
                return true;
            };
        }
        return request;
    }
}
exports.InfuraProvider = InfuraProvider;
//# sourceMappingURL=provider-infura.js.map