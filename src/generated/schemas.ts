// GENERATED. DO NOT EDIT.
// Source: spec/ydisk/, checked against provenance.json
// Run: pnpm generate

import { int64, number } from "@wirecat/cli-base/codegen/runtime"
import * as v from "valibot"
import type * as T from "./types.js"

export const AiPhotoEditorCounter: v.GenericSchema<unknown, T.AiPhotoEditorCounter> = v.looseObject({
  count: v.optional(int64()),
  max_count: v.optional(int64()),
  reset_datetime: v.optional(int64()),
})

export const CustomRestrictions: v.GenericSchema<unknown, T.CustomRestrictions> = v.looseObject({
  is_filesize_limit_reduced: v.optional(v.boolean()),
  monthly_traffic_limit_bytes: v.optional(int64()),
  photostream_photo_filesize_limit_bytes: v.optional(int64()),
  photostream_video_filesize_limit_bytes: v.optional(int64()),
})

export const Disk: v.GenericSchema<unknown, T.Disk> = v.looseObject({
  deletion_restriction_days: v.optional(int64()),
  disk_size: v.optional(int64()),
  file_size_limit_upgrades: v.optional(v.lazy(() => FileSizeLim)),
  free_photounlim_end_date: v.optional(int64()),
  hide_screenshots_in_photoslice: v.optional(v.boolean()),
  is_idm_managed_folder_address_access: v.optional(v.boolean()),
  is_idm_managed_public_access: v.optional(v.boolean()),
  is_legal_entity: v.optional(v.boolean()),
  is_paid: v.optional(v.boolean()),
  is_pro: v.optional(v.boolean()),
  is_sync_shared_folder_desktop: v.optional(v.boolean()),
  is_sync_vd_desktop: v.optional(v.boolean()),
  mail_size: v.optional(int64()),
  max_file_size: v.optional(int64()),
  monthly_traffic_limit: v.optional(int64()),
  monthly_traffic_limit_upgrades: v.optional(v.lazy(() => UploadTrafficLim)),
  paid_max_file_size: v.optional(int64()),
  payment_flow: v.optional(v.boolean()),
  photounlim_size: v.optional(int64()),
  reg_time: v.optional(v.string()),
  revision: v.optional(int64()),
  system_folders: v.optional(v.lazy(() => SystemFolders)),
  total_space: v.optional(int64()),
  trash_size: v.optional(int64()),
  unlimited_autoupload_enabled: v.optional(v.boolean()),
  used_space: v.optional(int64()),
  user: v.optional(v.lazy(() => User)),
  will_be_overdrawn: v.optional(v.boolean()),
})

export const DiskUserBlocked: v.GenericSchema<unknown, T.DiskUserBlocked> = v.looseObject({
  description: v.string(),
  details: v.optional(v.looseObject({})),
  error: v.string(),
  login: v.optional(v.string()),
  message: v.string(),
  uid: v.optional(int64()),
})

export const ApiError: v.GenericSchema<unknown, T.ApiError> = v.looseObject({
  description: v.string(),
  details: v.optional(v.looseObject({})),
  error: v.string(),
  message: v.string(),
})

export const FileSizeLim: v.GenericSchema<unknown, T.FileSizeLim> = v.looseObject({
  paid: v.optional(int64()),
  pro: v.optional(int64()),
})

export const SystemFolders: v.GenericSchema<unknown, T.SystemFolders> = v.looseObject({
  applications: v.optional(v.string()),
  attach: v.optional(v.string()),
  calendar: v.optional(v.string()),
  downloads: v.optional(v.string()),
  facebook: v.optional(v.string()),
  google: v.optional(v.string()),
  instagram: v.optional(v.string()),
  mailru: v.optional(v.string()),
  messenger: v.optional(v.string()),
  odnoklassniki: v.optional(v.string()),
  photostream: v.optional(v.string()),
  scans: v.optional(v.string()),
  screenshots: v.optional(v.string()),
  social: v.optional(v.string()),
  vkontakte: v.optional(v.string()),
})

export const UploadLimitExceededWithDetails: v.GenericSchema<unknown, T.UploadLimitExceededWithDetails> = v.looseObject(
  {
    description: v.string(),
    details: v.optional(v.looseObject({})),
    error: v.string(),
    limit: v.optional(int64()),
    message: v.string(),
    reason: v.optional(v.string()),
  },
)

export const UploadTrafficLim: v.GenericSchema<unknown, T.UploadTrafficLim> = v.looseObject({
  pro: v.optional(int64()),
})

export const User: v.GenericSchema<unknown, T.User> = v.looseObject({
  country: v.optional(v.string()),
  display_name: v.optional(v.string()),
  is_child: v.optional(v.boolean()),
  login: v.optional(v.string()),
  reg_time: v.optional(v.string()),
  uid: v.optional(v.string()),
})

export const AvailableUntil: v.GenericSchema<unknown, T.AvailableUntil> = v.looseObject({
  enabled: v.boolean(),
  value: v.optional(int64()),
})

export const CommentIds: v.GenericSchema<unknown, T.CommentIds> = v.looseObject({
  private_resource: v.optional(v.string()),
  public_resource: v.optional(v.string()),
})

export const DeleteResource: v.GenericSchema<unknown, T.DeleteResource> = v.looseObject({
  href: v.optional(v.string()),
  method: v.optional(v.string()),
  templated: v.optional(v.boolean()),
})

export const Delta: v.GenericSchema<unknown, T.Delta> = v.looseObject({
  change_type: v.string(),
  context: v.optional(v.lazy(() => DeltaContext)),
  discsw_symlink: v.optional(v.string()),
  new_path: v.optional(v.string()),
  path: v.string(),
  resource: v.optional(v.lazy(() => DeltaResource)),
  resource_id: v.string(),
  revision: int64(),
  share: v.optional(v.lazy(() => RootShareInfo)),
  type: v.string(),
})

export const DeltaContext: v.GenericSchema<unknown, T.DeltaContext> = v.looseObject({
  change_type: v.string(),
  new_path: v.string(),
  path: v.string(),
  req_id: v.string(),
  resource_id: v.string(),
  type: v.string(),
})

export const DeltaResource: v.GenericSchema<unknown, T.DeltaResource> = v.looseObject({
  md5: v.optional(v.string()),
  modified: v.string(),
  public_url: v.optional(v.string()),
  sha256: v.optional(v.string()),
  size: v.optional(int64()),
})

export const Deltas: v.GenericSchema<unknown, T.Deltas> = v.looseObject({
  items: v.array(v.lazy(() => Delta)),
  iteration_key: v.string(),
  revision: int64(),
})

export const ErrorWithData: v.GenericSchema<unknown, T.ErrorWithData> = v.looseObject({
  data: v.optional(v.looseObject({})),
  description: v.string(),
  details: v.optional(v.looseObject({})),
  error: v.string(),
  message: v.string(),
})

export const ExclusionsFromGeneratedAlbumsItems: v.GenericSchema<unknown, T.ExclusionsFromGeneratedAlbumsItems> =
  v.looseObject({
    items: v.optional(v.array(v.string())),
  })

export const Exif: v.GenericSchema<unknown, T.Exif> = v.looseObject({
  date_time: v.optional(v.string()),
  gps_latitude: v.optional(v.unknown()),
  gps_longitude: v.optional(v.unknown()),
})

export const FilesResourceList: v.GenericSchema<unknown, T.FilesResourceList> = v.looseObject({
  items: v.array(v.lazy(() => Resource)),
  limit: v.optional(int64()),
  offset: v.optional(int64()),
})

export const ImageMetadata: v.GenericSchema<unknown, T.ImageMetadata> = v.looseObject({
  angle: v.optional(int64()),
  beauty: v.optional(number()),
  height: v.optional(int64()),
  width: v.optional(int64()),
})

export const LastUploadedResourceList: v.GenericSchema<unknown, T.LastUploadedResourceList> = v.looseObject({
  items: v.array(v.lazy(() => Resource)),
  limit: v.optional(int64()),
})

export const Link: v.GenericSchema<unknown, T.Link> = v.looseObject({
  href: v.string(),
  method: v.string(),
  templated: v.optional(v.boolean()),
})

export const OfficeOnlineEditorURL: v.GenericSchema<unknown, T.OfficeOnlineEditorURL> = v.looseObject({
  edit_url: v.string(),
})

export const OrgId: v.GenericSchema<unknown, T.OrgId> = v.looseObject({
  enabled: v.boolean(),
  value: v.optional(v.string()),
})

export const Password: v.GenericSchema<unknown, T.Password> = v.looseObject({
  enabled: v.boolean(),
  value: v.optional(v.string()),
})

export const Preview: v.GenericSchema<unknown, T.Preview> = v.looseObject({
  name: v.optional(v.string()),
  url: v.optional(v.string()),
})

export const PublicResourcesList: v.GenericSchema<unknown, T.PublicResourcesList> = v.looseObject({
  items: v.array(v.lazy(() => Resource)),
  limit: v.optional(int64()),
  offset: v.optional(int64()),
  type: v.optional(v.string()),
})

export const PublishResource: v.GenericSchema<unknown, T.PublishResource> = v.looseObject({
  public_settings: v.optional(v.lazy(() => SetPublicSettings)),
})

export const Resource: v.GenericSchema<unknown, T.Resource> = v.looseObject({
  _embedded: v.optional(v.lazy(() => ResourceList)),
  antivirus_status: v.optional(v.unknown()),
  comment_ids: v.optional(v.lazy(() => CommentIds)),
  created: v.string(),
  custom_properties: v.optional(v.looseObject({})),
  exif: v.optional(v.lazy(() => Exif)),
  file: v.optional(v.string()),
  md5: v.optional(v.string()),
  media_type: v.optional(v.string()),
  mime_type: v.optional(v.string()),
  modified: v.string(),
  name: v.string(),
  path: v.string(),
  photoslice_time: v.optional(v.string()),
  preview: v.optional(v.string()),
  public_key: v.optional(v.string()),
  public_url: v.optional(v.string()),
  resource_id: v.optional(v.string()),
  revision: v.optional(int64()),
  sha256: v.optional(v.string()),
  share: v.optional(v.lazy(() => ShareInfo)),
  size: v.optional(int64()),
  sizes: v.optional(v.array(v.lazy(() => Preview))),
  type: v.string(),
})

export const ResourceDimensions: v.GenericSchema<unknown, T.ResourceDimensions> = v.looseObject({
  height: v.optional(int64()),
  width: v.optional(int64()),
})

export const ResourceList: v.GenericSchema<unknown, T.ResourceList> = v.looseObject({
  items: v.array(v.lazy(() => Resource)),
  limit: v.optional(int64()),
  offset: v.optional(int64()),
  path: v.string(),
  sort: v.optional(v.string()),
  total: v.optional(int64()),
})

export const ResourcePatch: v.GenericSchema<unknown, T.ResourcePatch> = v.looseObject({
  custom_properties: v.optional(v.looseObject({})),
})

export const ResourceUploadLink: v.GenericSchema<unknown, T.ResourceUploadLink> = v.looseObject({
  href: v.string(),
  method: v.string(),
  operation_id: v.string(),
  templated: v.optional(v.boolean()),
})

export const ResourceVersion: v.GenericSchema<unknown, T.ResourceVersion> = v.looseObject({
  can_be_restored: v.boolean(),
  created: v.string(),
  file: v.optional(v.string()),
  folded_items_iteration_key: v.optional(v.string()),
  id: v.string(),
  md5: v.optional(v.string()),
  platform_created: v.string(),
  sha256: v.optional(v.string()),
  size: v.optional(int64()),
  type: v.string(),
  uid_created: v.string(),
})

export const ResourceVersions: v.GenericSchema<unknown, T.ResourceVersions> = v.looseObject({
  items: v.array(v.lazy(() => ResourceVersion)),
  iteration_key: v.optional(v.string()),
})

export const RootShareInfo: v.GenericSchema<unknown, T.RootShareInfo> = v.looseObject({
  is_owned: v.optional(v.boolean()),
  rights: v.string(),
})

export const SearchResource: v.GenericSchema<unknown, T.SearchResource> = v.looseObject({
  _embedded: v.optional(v.lazy(() => SearchResource)),
  antivirus_status: v.optional(v.unknown()),
  comment_ids: v.optional(v.lazy(() => CommentIds)),
  created: v.string(),
  custom_properties: v.optional(v.looseObject({})),
  exif: v.optional(v.lazy(() => Exif)),
  file: v.optional(v.string()),
  md5: v.optional(v.string()),
  media_type: v.optional(v.string()),
  mime_type: v.optional(v.string()),
  modified: v.string(),
  name: v.string(),
  path: v.string(),
  photoslice_time: v.optional(v.string()),
  preview: v.optional(v.string()),
  public_key: v.optional(v.string()),
  public_url: v.optional(v.string()),
  resource_id: v.optional(v.string()),
  revision: v.optional(int64()),
  search_scope: v.optional(v.string()),
  sha256: v.optional(v.string()),
  share: v.optional(v.lazy(() => ShareInfo)),
  size: v.optional(int64()),
  sizes: v.optional(v.array(v.lazy(() => Preview))),
  type: v.string(),
})

export const SearchResourceList: v.GenericSchema<unknown, T.SearchResourceList> = v.looseObject({
  items: v.array(v.lazy(() => SearchResource)),
  iteration_key: v.optional(v.string()),
  limit: v.optional(int64()),
  offset: v.optional(int64()),
  path: v.string(),
  sort: v.optional(v.string()),
  total: v.optional(int64()),
})

export const SetPublicSettings: v.GenericSchema<unknown, T.SetPublicSettings> = v.looseObject({
  accesses: v.optional(v.array(v.looseObject({}))),
  available_until: v.optional(int64()),
  available_until_verbose: v.optional(v.lazy(() => AvailableUntil)),
  external_organization_id: v.optional(v.string()),
  external_organization_id_verbose: v.optional(v.lazy(() => OrgId)),
  password: v.optional(v.string()),
  password_verbose: v.optional(v.lazy(() => Password)),
  read_only: v.optional(v.boolean()),
})

export const ShareInfo: v.GenericSchema<unknown, T.ShareInfo> = v.looseObject({
  is_owned: v.optional(v.boolean()),
  is_root: v.optional(v.boolean()),
  rights: v.string(),
})

export const ShortInfoResource: v.GenericSchema<unknown, T.ShortInfoResource> = v.looseObject({
  hid: v.optional(v.string()),
  md5: v.optional(v.string()),
  mime_type: v.optional(v.string()),
  name: v.string(),
  path: v.string(),
  sha256: v.optional(v.string()),
  size: v.optional(int64()),
  type: v.string(),
})

export const Snapshot: v.GenericSchema<unknown, T.Snapshot> = v.looseObject({
  items: v.optional(v.array(v.lazy(() => SnapshotResource))),
  iteration_key: v.string(),
  revision: int64(),
})

export const SnapshotIterationKey: v.GenericSchema<unknown, T.SnapshotIterationKey> = v.looseObject({
  iteration_key: v.optional(v.string()),
})

export const SnapshotResource: v.GenericSchema<unknown, T.SnapshotResource> = v.looseObject({
  md5: v.optional(v.string()),
  modified: v.string(),
  path: v.string(),
  public_url: v.optional(v.string()),
  resource_id: v.optional(v.string()),
  revision: v.optional(int64()),
  sha256: v.optional(v.string()),
  share: v.optional(v.lazy(() => RootShareInfo)),
  size: v.optional(int64()),
  type: v.string(),
})

export const UploadResource: v.GenericSchema<unknown, T.UploadResource> = v.looseObject({
  operation_link: v.lazy(() => Link),
  upload_link: v.lazy(() => Link),
})

export const VideoMetadata: v.GenericSchema<unknown, T.VideoMetadata> = v.looseObject({
  duration: v.optional(int64()),
})

export const AddressAccess: v.GenericSchema<unknown, T.AddressAccess> = v.looseObject({
  id: v.optional(int64()),
  macros: v.optional(v.array(v.string())),
  org_id: v.optional(int64()),
  rights: v.array(v.string()),
  type: v.picklist(["macro", "department", "group", "user", "outer_user"]),
})

export const GetAvailableSettings: v.GenericSchema<unknown, T.GetAvailableSettings> = v.looseObject({
  address_access_sharing: v.optional(v.string()),
  default: v.array(v.string()),
  macro_sharing: v.optional(v.string()),
  permissions: v.array(v.string()),
  sharing_restriction: v.optional(v.lazy(() => SharingRestriction)),
  use_sharing: v.optional(v.boolean()),
})

export const GetPublicSettings: v.GenericSchema<unknown, T.GetPublicSettings> = v.looseObject({
  accesses: v.optional(v.array(v.lazy(() => PublicSettingsAccesses))),
  available_until: v.optional(int64()),
})

export const Name: v.GenericSchema<unknown, T.Name> = v.looseObject({
  first: v.optional(v.string()),
  last: v.optional(v.string()),
  middle: v.optional(v.string()),
})

export const PublicResource: v.GenericSchema<unknown, T.PublicResource> = v.looseObject({
  _embedded: v.optional(v.lazy(() => PublicResourceList)),
  antivirus_status: v.optional(v.unknown()),
  comment_ids: v.optional(v.lazy(() => CommentIds)),
  created: v.string(),
  exif: v.optional(v.lazy(() => Exif)),
  file: v.optional(v.string()),
  md5: v.optional(v.string()),
  media_type: v.optional(v.string()),
  mime_type: v.optional(v.string()),
  modified: v.string(),
  name: v.string(),
  path: v.string(),
  photoslice_time: v.optional(v.string()),
  preview: v.optional(v.string()),
  public_key: v.string(),
  public_url: v.optional(v.string()),
  resource_id: v.optional(v.string()),
  revision: v.optional(int64()),
  sha256: v.optional(v.string()),
  share: v.optional(v.lazy(() => ShareInfo)),
  size: v.optional(int64()),
  sizes: v.optional(v.array(v.lazy(() => Preview))),
  type: v.string(),
  views_count: v.optional(int64()),
})

export const PublicResourceList: v.GenericSchema<unknown, T.PublicResourceList> = v.looseObject({
  items: v.array(v.lazy(() => PublicResource)),
  limit: v.optional(int64()),
  offset: v.optional(int64()),
  path: v.string(),
  public_key: v.string(),
  sort: v.optional(v.string()),
  total: v.optional(int64()),
})

export const PublicSettingsAccesses: v.GenericSchema<unknown, T.PublicSettingsAccesses> = v.looseObject({
  id: v.optional(int64()),
  macros: v.array(v.string()),
  org_id: v.optional(int64()),
  rights: v.array(v.string()),
  type: v.optional(v.string()),
})

export const SharingRestriction: v.GenericSchema<unknown, T.SharingRestriction> = v.looseObject({
  address_access_sharing: v.picklist(["all", "deny"]),
  address_access_sharing_outer: v.picklist(["all", "employees"]),
  public_sharing: v.picklist(["all", "deny"]),
  public_sharing_outer: v.picklist(["all", "employees"]),
})

export const UpdatePublicSettings: v.GenericSchema<unknown, T.UpdatePublicSettings> = v.looseObject({
  accesses: v.optional(v.array(v.lazy(() => AddressAccess))),
  available_until: v.optional(int64()),
  password: v.optional(v.string()),
})

export const UserPublicInformation: v.GenericSchema<unknown, T.UserPublicInformation> = v.looseObject({
  display_name: v.optional(v.string()),
  login: v.optional(v.string()),
  uid: v.optional(v.string()),
})

export const TrashResource: v.GenericSchema<unknown, T.TrashResource> = v.looseObject({
  _embedded: v.optional(v.lazy(() => TrashResourceList)),
  antivirus_status: v.optional(v.unknown()),
  comment_ids: v.optional(v.lazy(() => CommentIds)),
  created: v.string(),
  custom_properties: v.optional(v.looseObject({})),
  deleted: v.optional(v.string()),
  exif: v.optional(v.lazy(() => Exif)),
  file: v.optional(v.string()),
  md5: v.optional(v.string()),
  media_type: v.optional(v.string()),
  mime_type: v.optional(v.string()),
  modified: v.string(),
  name: v.string(),
  origin_path: v.optional(v.string()),
  path: v.string(),
  photoslice_time: v.optional(v.string()),
  preview: v.optional(v.string()),
  public_key: v.optional(v.string()),
  public_url: v.optional(v.string()),
  resource_id: v.optional(v.string()),
  revision: v.optional(int64()),
  sha256: v.optional(v.string()),
  share: v.optional(v.lazy(() => ShareInfo)),
  size: v.optional(int64()),
  sizes: v.optional(v.array(v.lazy(() => Preview))),
  type: v.string(),
})

export const TrashResourceList: v.GenericSchema<unknown, T.TrashResourceList> = v.looseObject({
  items: v.array(v.lazy(() => TrashResource)),
  limit: v.optional(int64()),
  offset: v.optional(int64()),
  path: v.string(),
  sort: v.optional(v.string()),
  total: v.optional(int64()),
})

export const OperationStatus: v.GenericSchema<unknown, T.OperationStatus> = v.looseObject({
  status: v.string(),
})

export const schemas = {
  AiPhotoEditorCounter,
  CustomRestrictions,
  Disk,
  DiskUserBlocked,
  ApiError,
  FileSizeLim,
  SystemFolders,
  UploadLimitExceededWithDetails,
  UploadTrafficLim,
  User,
  AvailableUntil,
  CommentIds,
  DeleteResource,
  Delta,
  DeltaContext,
  DeltaResource,
  Deltas,
  ErrorWithData,
  ExclusionsFromGeneratedAlbumsItems,
  Exif,
  FilesResourceList,
  ImageMetadata,
  LastUploadedResourceList,
  Link,
  OfficeOnlineEditorURL,
  OrgId,
  Password,
  Preview,
  PublicResourcesList,
  PublishResource,
  Resource,
  ResourceDimensions,
  ResourceList,
  ResourcePatch,
  ResourceUploadLink,
  ResourceVersion,
  ResourceVersions,
  RootShareInfo,
  SearchResource,
  SearchResourceList,
  SetPublicSettings,
  ShareInfo,
  ShortInfoResource,
  Snapshot,
  SnapshotIterationKey,
  SnapshotResource,
  UploadResource,
  VideoMetadata,
  AddressAccess,
  GetAvailableSettings,
  GetPublicSettings,
  Name,
  PublicResource,
  PublicResourceList,
  PublicSettingsAccesses,
  SharingRestriction,
  UpdatePublicSettings,
  UserPublicInformation,
  TrashResource,
  TrashResourceList,
  OperationStatus,
} as const
