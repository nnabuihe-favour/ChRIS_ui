import { action } from "typesafe-actions";
import { PluginActionTypes } from "./types";

import {
  FeedFile,
  PluginParameter,
  Plugin,
  PluginInstance,
} from "@fnndsc/chrisapi";

export const getPluginFiles = (selected: PluginInstance) =>
  action(PluginActionTypes.GET_PLUGIN_FILES, selected);
export const getPluginFilesSuccess = (items: PluginInstance[]) =>
  action(PluginActionTypes.GET_PLUGIN_FILES_SUCCESS, items);

export const getPluginDetailsRequest = (item: PluginInstance) =>
  action(PluginActionTypes.GET_PLUGIN_DETAILS, item);
export const getPluginDetailsSuccess = (items: PluginInstance[]) =>
  action(PluginActionTypes.GET_PLUGIN_DETAILS_SUCCESS, items);

export const destroyPlugin = () => action(PluginActionTypes.RESET_PLUGIN_STATE);

export const getPluginStatus = (pluginStatus: String) =>
  action(PluginActionTypes.GET_PLUGIN_STATUS, pluginStatus);

export const addFiles = (files: FeedFile[]) =>
  action(PluginActionTypes.ADD_FILES, files);

export const getParams = (plugin: Plugin) =>
  action(PluginActionTypes.GET_PARAMS, plugin);

export const getParamsSuccess = (params: PluginParameter[]) =>
  action(PluginActionTypes.GET_PARAMS_SUCCESS, params);
