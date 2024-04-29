/// <reference types="@rbxts/types" />
import { InstanceTree } from "@rbxts/validate-tree";
import { InstanceCache } from "@rbxts/instance-cache";
import { HttpService, Workspace } from "@rbxts/services";

const CF_REALLY_FAR_AWAY = new CFrame(0, 10e4, 0);

export class AssetManager {
	private readonly guids = new Map<Instance, string>();
	private readonly assets: Map<string, InstanceCache<Instance>> = new Map();
	private readonly baseparts: Map<string, InstanceCache<BasePart>> = new Map();
    private readonly assetModels: Map<string, InstanceCache<Model>> = new Map();

	constructor(private readonly assetRoot: Instance) {}

	cacheAssetBasepart(asset: BasePart, tree: InstanceTree, location?: Instance, amount?: number) {
		if (this.guids.has(asset)) return warn(`Basepart ${asset.Name} already cached`);
		const assetName = HttpService.GenerateGUID();
		this.guids.set(asset, assetName);
		if (this.baseparts.has(assetName)) return warn(`Basepart ${assetName} already cached`);
		asset.CFrame = CF_REALLY_FAR_AWAY;
		const cache = new InstanceCache(asset, tree, location, amount);
		this.baseparts.set(assetName, cache);
		return assetName;
	}

	returnAssetBasepart(assetName: string, asset: BasePart) {
		const cache = this.baseparts.get(assetName);
		if (!cache) return warn(`Basepart ${assetName} not cached`);
		asset.CFrame = CF_REALLY_FAR_AWAY;
		cache.Return(asset);
	}

	getAssetBasepart(assetName: string, location?: Instance): BasePart | undefined {
		const cache = this.baseparts.get(assetName);
		if (!cache) {
			warn(`Basepart ${assetName} not cached`);
			return undefined;
		}
		const basepart = cache.Get(location);
		return basepart as BasePart;
	}

    flush(assetName: string) {
        const modelCache = this.assetModels.get(assetName);
        const assetCache = this.assets.get(assetName);
        const basepartCache = this.baseparts.get(assetName);
        if (!modelCache && !assetCache && !basepartCache) return warn(`Asset ${assetName} not cached`);
        const cache = modelCache ?? assetCache ?? basepartCache;
        cache?.Flush();
    }
}
