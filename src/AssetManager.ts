/// <reference types="@rbxts/types" />
import { InstanceTree } from "@rbxts/validate-tree";
import { InstanceCache } from "@rbxts/instance-cache";
import { Workspace } from "@rbxts/services";

const CF_REALLY_FAR_AWAY = new CFrame(0, 10e4, 0);

export class AssetManager {
	private readonly assets: Map<string, InstanceCache<Instance>> = new Map();
	private readonly baseparts: Map<string, InstanceCache<BasePart>> = new Map();
	private readonly assetPositions: Map<string, Vector3> = new Map();

	constructor(private readonly assetRoot: Instance) {}

	cacheAssetBasepart(assetName: string, asset: BasePart, tree: InstanceTree, location?: Instance, amount?: number) {
		if (this.baseparts.has(assetName)) return warn(`Basepart ${assetName} already cached`);
		asset.CFrame = CF_REALLY_FAR_AWAY;
		const cache = new InstanceCache(asset, tree, location, amount);
		this.baseparts.set(assetName, cache);
	}

	returnAssetBasepart(assetName: string, asset: BasePart) {
		const cache = this.baseparts.get(assetName);
		if (!cache) return warn(`Basepart ${assetName} not cached`);
		asset.CFrame = CF_REALLY_FAR_AWAY;
		cache.Return(asset);
	}

    
}
