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

    getAsset(path: string) {
        
    }

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

	cacheAsset(asset: Instance, tree: InstanceTree, location?: Instance, amount?: number) {
		if (this.guids.has(asset)) return warn(`Asset ${asset.Name} already cached`);
		const assetName = HttpService.GenerateGUID();
		this.guids.set(asset, assetName);
		if (this.assets.has(assetName)) return warn(`Asset ${assetName} already cached`);
		const cache = new InstanceCache(asset, tree, location, amount);
		this.assets.set(assetName, cache);
		return assetName;
	}

	cacheAssetModel(asset: Model, tree: InstanceTree, location?: Instance, amount?: number) {
		if (this.guids.has(asset)) return warn(`Model ${asset.Name} already cached`);
		const assetName = HttpService.GenerateGUID();
		this.guids.set(asset, assetName);
		if (this.assetModels.has(assetName)) return warn(`Model ${assetName} already cached`);
		asset.PivotTo(CF_REALLY_FAR_AWAY);
		const cache = new InstanceCache(asset, tree, location, amount);
		this.assetModels.set(assetName, cache);
		return assetName;
	}

	return<T>(assetName: string, asset: T) {
		const modelCache = this.assetModels.get(assetName);
		const assetCache = this.assets.get(assetName);
		const basepartCache = this.baseparts.get(assetName);
		if (!modelCache && !assetCache && !basepartCache) return warn(`Asset ${assetName} not cached`);
		const cache = modelCache ?? assetCache ?? basepartCache;
		const map = modelCache
			? this.assetModels
			: assetCache
				? this.assets
				: basepartCache
					? this.baseparts
					: undefined;
		map === this.assetModels
			? (asset as Model).PivotTo(CF_REALLY_FAR_AWAY)
			: ((asset as BasePart).CFrame = CF_REALLY_FAR_AWAY);
		return cache?.Return(
			map === this.assetModels
				? (asset as Model)
				: map === this.assets
					? (asset as Instance)
					: (asset as BasePart),
		);
	}

	get<T>(assetName: string, location?: Instance): T | void {
		const modelCache = this.assetModels.get(assetName);
		const assetCache = this.assets.get(assetName);
		const basepartCache = this.baseparts.get(assetName);
		if (!modelCache && !assetCache && !basepartCache) return warn(`Asset ${assetName} not cached`);
		const cache = modelCache ?? assetCache ?? basepartCache;
		return cache?.Get(location) as T;
	}

	flush(assetName: string) {
		const modelCache = this.assetModels.get(assetName);
		const assetCache = this.assets.get(assetName);
		const basepartCache = this.baseparts.get(assetName);
		if (!modelCache && !assetCache && !basepartCache) return warn(`Asset ${assetName} not cached`);
		const cache = modelCache ?? assetCache ?? basepartCache;
		cache?.Flush();
	}

	destroy(assetName: string) {
		const modelCache = this.assetModels.get(assetName);
		const assetCache = this.assets.get(assetName);
		const basepartCache = this.baseparts.get(assetName);
		if (!modelCache && !assetCache && !basepartCache) return warn(`Asset ${assetName} not cached`);
		const cache = modelCache ?? assetCache ?? basepartCache;
		cache?.Destroy();
		const map = modelCache
			? this.assetModels
			: assetCache
				? this.assets
				: basepartCache
					? this.baseparts
					: undefined;
		map?.delete(assetName);
		this.guids.forEach((guid, instance) => {
			if (guid === assetName) this.guids.delete(instance);
		});
	}
}
