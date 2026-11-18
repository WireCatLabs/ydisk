// GENERATED. DO NOT EDIT.
// Source: spec/ydisk/, checked against provenance.json
// Run: pnpm generate

export type AiPhotoEditorCounter = {
  /** Количество сохранений */
  count?: string
  /** Максимальное количество сохранений */
  max_count?: string
  /** Дата и время сброса счетчика, timestamp в секундах */
  reset_datetime?: string
}

export type CustomRestrictions = {
  /** Признак уменьшенного лимита размера файла. */
  is_filesize_limit_reduced?: boolean
  /** Максимальный месячный трафик на загрузку в байтах. */
  monthly_traffic_limit_bytes?: string
  /** Максимальный размер фото в автозагрузке в байтах. */
  photostream_photo_filesize_limit_bytes?: string
  /** Максимальный размер видео в автозагрузке в байтах. */
  photostream_video_filesize_limit_bytes?: string
}

export type Disk = {
  /** Количество дней до удаления файлов после блокировки */
  deletion_restriction_days?: string
  /** Используемый объем диска (байт). */
  disk_size?: string
  /** Возможные апгрейды максимального размера файла для загрузки. */
  file_size_limit_upgrades?: FileSizeLim
  /** Timestamp ms окончания бесплатного места в фотобезлимите */
  free_photounlim_end_date?: string
  /** Настройка скрытия скриншотов у пользователя */
  hide_screenshots_in_photoslice?: boolean
  /** Признак управления адресным доступом публичным доступом для папок */
  is_idm_managed_folder_address_access?: boolean
  /** Признак управления адресным доступом публичным доступом для файлов */
  is_idm_managed_public_access?: boolean
  /** Признак принадлежности пользователя к юридическому лицу */
  is_legal_entity?: boolean
  /** Признак наличия купленного места. */
  is_paid?: boolean
  /** Признак тарифа Про. */
  is_pro?: boolean
  /** Признак синхронизации общего доступа в ПО */
  is_sync_shared_folder_desktop?: boolean
  /** Признак синхронизации общих дисков в ПО */
  is_sync_vd_desktop?: boolean
  /** Используемый объем почты (байт). Входит в used_space. */
  mail_size?: string
  /** Максимальный поддерживаемый размер файла. */
  max_file_size?: string
  /** Максимальный месячный трафик на загрузку. */
  monthly_traffic_limit?: string
  /** Возможные апгрейды максимального месячного трафика на загрузку. */
  monthly_traffic_limit_upgrades?: UploadTrafficLim
  /** Максимальный поддерживаемый размер файла для платного аккаунта. */
  paid_max_file_size?: string
  /** Признак причастности пользователя к payment_flow */
  payment_flow?: boolean
  /** Общий размер файлов в фотобезлимите. */
  photounlim_size?: string
  /** Дата регистрации Диска */
  reg_time?: string
  /** Текущая ревизия Диска */
  revision?: string
  /** Адреса системных папок в Диске пользователя. */
  system_folders?: SystemFolders
  /** Общий объем хранилища (байт) */
  total_space?: string
  /** Общий размер файлов в Корзине (байт). Входит в used_space. */
  trash_size?: string
  /** Признак включенной безлимитной автозагрузки с мобильных устройств. */
  unlimited_autoupload_enabled?: boolean
  /** Используемый объем хранилища (байт) */
  used_space?: string
  /** Владелец Диска */
  user?: User
  /** Признак - будет ли пользователь в овердрафте по достижении free_photounlim_end_date */
  will_be_overdrawn?: boolean
}

export type DiskUserBlocked = {
  /** Техническое описание ошибки */
  description: string
  /** Дополнительные детали ошибки */
  details?: Record<string, unknown>
  /** Уникальный код ошибки */
  error: string
  /** Логин пользователя */
  login?: string
  /** Человекочитаемое описание ошибки */
  message: string
  /** uid пользователя */
  uid?: string
}

export type ApiError = {
  /** Техническое описание ошибки */
  description: string
  /** Дополнительные детали ошибки */
  details?: Record<string, unknown>
  /** Уникальный код ошибки */
  error: string
  /** Человекочитаемое описание ошибки */
  message: string
}

export type FileSizeLim = {
  /** Максимальный размер файла для загрузки у платного аккаунта. */
  paid?: string
  /** Максимальный размер файла для загрузки у платного аккаунта с тарифом про. */
  pro?: string
}

export type SystemFolders = {
  /** Путь к папке "Приложения". */
  applications?: string
  /** Путь к папке "Почтовые вложения". */
  attach?: string
  /** Путь к папке "Материалы встреч". */
  calendar?: string
  /** Путь к папке "Загрузки". */
  downloads?: string
  /** Путь к папке "Социальные сети/Facebook". */
  facebook?: string
  /** Путь к папке "Социальные сети/Google+". */
  google?: string
  /** Путь к папке "Социальные сети/Instagram". */
  instagram?: string
  /** Путь к папке "Социальные сети/Мой Мир". */
  mailru?: string
  /** Путь к папке "Файлы Мессенджера". */
  messenger?: string
  /** Путь к папке "Социальные сети/Одноклассники". */
  odnoklassniki?: string
  /** Путь к папке "Фотокамера". */
  photostream?: string
  /** Путь к папке "Сканы". */
  scans?: string
  /** Путь к папке "Скриншоты". */
  screenshots?: string
  /** Путь к папке "Социальные сети". */
  social?: string
  /** Путь к папке "Социальные сети/ВКонтакте". */
  vkontakte?: string
}

export type UploadLimitExceededWithDetails = {
  /** Техническое описание ошибки */
  description: string
  /** Дополнительные детали ошибки */
  details?: Record<string, unknown>
  /** Уникальный код ошибки */
  error: string
  /** Значение лимита. */
  limit?: string
  /** Человекочитаемое описание ошибки */
  message: string
  /** Причина срабатывания лимита. */
  reason?: string
}

export type UploadTrafficLim = {
  /** Максимальный размер месячного трафика на загрузку у платного аккаунта с тарифом про. */
  pro?: string
}

export type User = {
  /** Страна */
  country?: string
  /** Отображаемое имя */
  display_name?: string
  /** Признак того что аккаунт является детским */
  is_child?: boolean
  /** Логин */
  login?: string
  /** Дата регистрации Диска */
  reg_time?: string
  /** Идентификатор пользователя */
  uid?: string
}

export type AvailableUntil = {
  /** Признак включенности настройки. */
  enabled: boolean
  /** Время жизни ссылки. */
  value?: string
}

export type CommentIds = {
  /** Идентификатор комментариев для приватных ресурсов. */
  private_resource?: string
  /** Идентификатор комментариев для публичных ресурсов. */
  public_resource?: string
}

export type DeleteResource = {
  /** URL */
  href?: string
  /** HTTP-метод */
  method?: string
  /** Признак шаблонизированного URL */
  templated?: boolean
}

export type Delta = {
  /** Тип изменения */
  change_type: string
  /** Контекст, в рамках которого произошло изменение */
  context?: DeltaContext
  /** Disk software symlink */
  discsw_symlink?: string
  /** Новый путь к ресурсу */
  new_path?: string
  /** Путь к ресурсу */
  path: string
  /** Ресурс, для которого произошло изменение */
  resource?: DeltaResource
  /** Идентификатор ресурса */
  resource_id: string
  /** Ревизия */
  revision: string
  /** Информация об общей папке */
  share?: RootShareInfo
  /** Тип ресурса */
  type: string
}

export type DeltaContext = {
  /** Тип изменения */
  change_type: string
  /** Новый путь к ресурсу */
  new_path: string
  /** Путь к ресурсу */
  path: string
  /** Идентификатор запроса или операции */
  req_id: string
  /** Идентификатор ресурса */
  resource_id: string
  /** Тип ресурса */
  type: string
}

export type DeltaResource = {
  /** MD5-хэш */
  md5?: string
  /** Дата изменения */
  modified: string
  /** Публичный URL */
  public_url?: string
  /** SHA256-хэш */
  sha256?: string
  /** Размер файла */
  size?: string
}

export type Deltas = {
  /** Список изменений */
  items: Array<Delta>
  iteration_key: string
  /** Ревизия Диска */
  revision: string
}

export type ErrorWithData = {
  /** Данные, передаваемые с ошибкой. */
  data?: Record<string, unknown>
  /** Техническое описание ошибки */
  description: string
  /** Дополнительные детали ошибки */
  details?: Record<string, unknown>
  /** Уникальный код ошибки */
  error: string
  /** Человекочитаемое описание ошибки */
  message: string
}

export type ExclusionsFromGeneratedAlbumsItems = {
  /** Список исключений из автосгенерированных альбомов. */
  items?: Array<string>
}

export type Exif = {
  /** Дата съёмки. */
  date_time?: string
  /** Координата съемки (широта). */
  gps_latitude?: unknown
  /** Координата съемки (долгота). */
  gps_longitude?: unknown
}

export type FilesResourceList = {
  /** Элементы списка */
  items: Array<Resource>
  /** Количество элементов на странице */
  limit?: string
  /** Смещение от начала списка */
  offset?: string
}

export type ImageMetadata = {
  /** Угол поворота изображения */
  angle?: string
  /** Красивость изображения по компьютерному зрению */
  beauty?: number
  /** Ширина */
  height?: string
  /** Высота */
  width?: string
}

export type LastUploadedResourceList = {
  /** Элементы списка */
  items: Array<Resource>
  /** Количество элементов на странице */
  limit?: string
}

export type Link = {
  /** URL */
  href: string
  /** HTTP-метод */
  method: string
  /** Признак шаблонизированного URL */
  templated?: boolean
}

export type OfficeOnlineEditorURL = {
  /** Ссылка на редактирование файла. */
  edit_url: string
}

export type OrgId = {
  /** Признак включенности настройки. */
  enabled: boolean
  /** Ограничение на организацию. */
  value?: string
}

export type Password = {
  /** Признак включенности настройки. */
  enabled: boolean
  /** Пароль от ссылки. */
  value?: string
}

export type Preview = {
  /** Название (размер) превью */
  name?: string
  /** Ссылка на скачивание превью */
  url?: string
}

export type PublicResourcesList = {
  /** Элементы списка */
  items: Array<Resource>
  /** Количество элементов на странице */
  limit?: string
  /** Смещение от начала списка */
  offset?: string
  /** Значение фильтра по типу ресурсов */
  type?: string
}

export type PublishResource = {
  /** Настройки адресного доступа. */
  public_settings?: SetPublicSettings
}

export type Resource = {
  /** Список вложенных ресурсов */
  _embedded?: ResourceList
  /** Статус проверки антивирусом */
  antivirus_status?: unknown
  /** Идентификаторы комментариев */
  comment_ids?: CommentIds
  /** Дата создания */
  created: string
  /** Пользовательские атрибуты ресурса */
  custom_properties?: Record<string, unknown>
  /** Метаданные медиафайла (EXIF) */
  exif?: Exif
  /** URL для скачивания файла */
  file?: string
  /** MD5-хэш */
  md5?: string
  /** Определённый Диском тип файла */
  media_type?: string
  /** MIME-тип файла */
  mime_type?: string
  /** Дата изменения */
  modified: string
  /** Имя */
  name: string
  /** Путь к ресурсу */
  path: string
  /** Дата создания фото или видео файла */
  photoslice_time?: string
  /** URL превью файла */
  preview?: string
  /** Ключ опубликованного ресурса */
  public_key?: string
  /** Публичный URL */
  public_url?: string
  /** Идентификатор ресурса */
  resource_id?: string
  /** Ревизия Диска в которой этот ресурс был изменён последний раз */
  revision?: string
  /** SHA256-хэш */
  sha256?: string
  /** Информация об общей папке */
  share?: ShareInfo
  /** Размер файла */
  size?: string
  /** Все размеры превью с URL для скачивания */
  sizes?: Array<Preview>
  /** Тип */
  type: string
}

export type ResourceDimensions = {
  /** Высота изображения. */
  height?: string
  /** Ширина изображения. */
  width?: string
}

export type ResourceList = {
  /** Элементы списка */
  items: Array<Resource>
  /** Количество элементов на странице */
  limit?: string
  /** Смещение от начала списка */
  offset?: string
  /** Путь к ресурсу, для которого построен список */
  path: string
  /** Поле, по которому отсортирован список */
  sort?: string
  /** Общее количество элементов в списке */
  total?: string
}

export type ResourcePatch = {
  /** Пользовательские атрибуты ресурса */
  custom_properties?: Record<string, unknown>
}

export type ResourceUploadLink = {
  /** URL */
  href: string
  /** HTTP-метод */
  method: string
  /** Идентификатор операции загрузки файла */
  operation_id: string
  /** Признак шаблонизированного URL */
  templated?: boolean
}

export type ResourceVersion = {
  /** Может ли версия быть восстановлена */
  can_be_restored: boolean
  /** Дата создания */
  created: string
  /** URL для скачивания файла */
  file?: string
  /** iteration_key для получения свернутых версию */
  folded_items_iteration_key?: string
  /** ID версии */
  id: string
  /** MD5-хэш */
  md5?: string
  /** Название платформы, из которой создали версию */
  platform_created: string
  /** SHA256-хэш */
  sha256?: string
  /** Размер версии (только для бинарных) */
  size?: string
  /** Тип версии */
  type: string
  /** uid пользователя создавшего версию */
  uid_created: string
}

export type ResourceVersions = {
  /** Список версий. */
  items: Array<ResourceVersion>
  /** Ключ итерирования по списку версий. */
  iteration_key?: string
}

export type RootShareInfo = {
  /** Признак, что текущий пользователь является владельцем общей папки */
  is_owned?: boolean
  /** Права доступа */
  rights: string
}

export type SearchResource = {
  /** Список вложенных ресурсов */
  _embedded?: SearchResource
  /** Статус проверки антивирусом */
  antivirus_status?: unknown
  /** Идентификаторы комментариев */
  comment_ids?: CommentIds
  /** Дата создания */
  created: string
  /** Пользовательские атрибуты ресурса */
  custom_properties?: Record<string, unknown>
  /** Метаданные медиафайла (EXIF) */
  exif?: Exif
  /** URL для скачивания файла */
  file?: string
  /** MD5-хэш */
  md5?: string
  /** Определённый Диском тип файла */
  media_type?: string
  /** MIME-тип файла */
  mime_type?: string
  /** Дата изменения */
  modified: string
  /** Имя */
  name: string
  /** Путь к ресурсу */
  path: string
  /** Дата создания фото или видео файла */
  photoslice_time?: string
  /** URL превью файла */
  preview?: string
  /** Ключ опубликованного ресурса */
  public_key?: string
  /** Публичный URL */
  public_url?: string
  /** Идентификатор ресурса */
  resource_id?: string
  /** Ревизия Диска в которой этот ресурс был изменён последний раз */
  revision?: string
  /** Механизм индексации документа */
  search_scope?: string
  /** SHA256-хэш */
  sha256?: string
  /** Информация об общей папке */
  share?: ShareInfo
  /** Размер файла */
  size?: string
  /** Все размеры превью с URL для скачивания */
  sizes?: Array<Preview>
  /** Тип */
  type: string
}

export type SearchResourceList = {
  /** Элементы списка */
  items: Array<SearchResource>
  /** Поле, по которому отсортирован список */
  iteration_key?: string
  /** Количество элементов на странице */
  limit?: string
  /** Смещение от начала списка */
  offset?: string
  /** Путь к ресурсу, для которого построен список */
  path: string
  /** Поле, по которому отсортирован список */
  sort?: string
  /** Общее количество элементов в списке */
  total?: string
}

export type SetPublicSettings = {
  /** Массив параметров, которые задают права доступа пользователей к ресурсу. Позволяет задать настройки для разных уровней доступа: * общего — внутри организации или для любых пользователей Яндекс 360 для бизнеса; * персонального для определенных сотрудников организации; * персонального для определенных групп; * персонального для определенных подразделений. */
  accesses?: Array<Record<string, unknown>>
  /** Время жизни ссылки. */
  available_until?: string
  /** Время жизни ссылки. */
  available_until_verbose?: AvailableUntil
  /** Ограничение на организацию. */
  external_organization_id?: string
  /** Ограничение на организацию. */
  external_organization_id_verbose?: OrgId
  /** Пароль от ссылки. */
  password?: string
  /** Пароль от ссылки. */
  password_verbose?: Password
  /** Признак того, что ссылка доступна только на чтение. */
  read_only?: boolean
}

export type ShareInfo = {
  /** Признак, что текущий пользователь является владельцем общей папки */
  is_owned?: boolean
  /** Признак того, что папка является корневой в группе */
  is_root?: boolean
  /** Права доступа */
  rights: string
}

export type ShortInfoResource = {
  /** HID файла */
  hid?: string
  /** MD5-хэш */
  md5?: string
  /** MIME-тип файла */
  mime_type?: string
  /** Имя */
  name: string
  /** Путь к ресурсу */
  path: string
  /** SHA256-хэш */
  sha256?: string
  /** Размер файла */
  size?: string
  /** Тип */
  type: string
}

export type Snapshot = {
  /** Элементы снепшота */
  items?: Array<SnapshotResource>
  iteration_key: string
  /** Ревизия Диска */
  revision: string
}

export type SnapshotIterationKey = {
  /** Ключ итерации */
  iteration_key?: string
}

export type SnapshotResource = {
  /** MD5-хэш */
  md5?: string
  /** Дата изменения */
  modified: string
  /** Путь к ресурсу */
  path: string
  /** Публичный URL */
  public_url?: string
  /** Идентификатор ресурса */
  resource_id?: string
  /** Ревизия Диска в которой этот ресурс был изменён последний раз */
  revision?: string
  /** SHA256-хэш */
  sha256?: string
  /** Информация об общей папке */
  share?: RootShareInfo
  /** Размер файла */
  size?: string
  /** Тип */
  type: string
}

export type UploadResource = {
  /** Ссылка на получение статуса операции. */
  operation_link: Link
  /** URL файла. */
  upload_link: Link
}

export type VideoMetadata = {
  /** Длительность видео в миллисекундах */
  duration?: string
}

export type AddressAccess = {
  /** Уникальный идентификатор пользователя/группы/подразделения. */
  id?: string
  /** Тип макроса. */
  macros?: Array<string>
  /** Идентификатор организации. */
  org_id?: string
  /** Пермиссии доступа к ресурсу. */
  rights: Array<string>
  /** Уровень пермиссии. */
  type: "macro" | "department" | "group" | "user" | "outer_user"
}

export type GetAvailableSettings = {
  /** Использование адресного доступа, возможность шарить */
  address_access_sharing?: string
  /** Значения по умолчанию */
  default: Array<string>
  /** Использование общего доступа, возможность шарить на внешних пользователей */
  macro_sharing?: string
  /** Список доступных прав */
  permissions: Array<string>
  /** Ограничения на шаринг */
  sharing_restriction?: SharingRestriction
  /** Параметр возможности расшарить адресно */
  use_sharing?: boolean
}

export type GetPublicSettings = {
  /** Cправочники прав адресного доступа. */
  accesses?: Array<PublicSettingsAccesses>
  /** Время жизни ссылки. */
  available_until?: string
}

export type Name = {
  /** Имя пользователя */
  first?: string
  /** Фамилия пользователя */
  last?: string
  /** Отчество пользователя */
  middle?: string
}

export type PublicResource = {
  /** Список вложенных ресурсов */
  _embedded?: PublicResourceList
  /** Статус проверки антивирусом */
  antivirus_status?: unknown
  /** Идентификаторы комментариев */
  comment_ids?: CommentIds
  /** Дата создания */
  created: string
  /** Метаданные медиафайла (EXIF) */
  exif?: Exif
  /** URL для скачивания файла */
  file?: string
  /** MD5-хэш */
  md5?: string
  /** Определённый Диском тип файла */
  media_type?: string
  /** MIME-тип файла */
  mime_type?: string
  /** Дата изменения */
  modified: string
  /** Имя */
  name: string
  /** Путь опубликованного ресурса */
  path: string
  /** Дата создания фото или видео файла */
  photoslice_time?: string
  /** URL превью файла */
  preview?: string
  /** Ключ опубликованного ресурса */
  public_key: string
  /** Публичный URL */
  public_url?: string
  /** Идентификатор ресурса */
  resource_id?: string
  /** Ревизия Диска в которой этот ресурс был изменён последний раз */
  revision?: string
  /** SHA256-хэш */
  sha256?: string
  /** Информация об общей папке */
  share?: ShareInfo
  /** Размер файла */
  size?: string
  /** Все размеры превью с URL для скачивания */
  sizes?: Array<Preview>
  /** Тип */
  type: string
  /** Счетчик просмотров публичного ресурса */
  views_count?: string
}

export type PublicResourceList = {
  /** Элементы списка */
  items: Array<PublicResource>
  /** Количество элементов на странице */
  limit?: string
  /** Смещение от начала списка */
  offset?: string
  /** Путь опубликованного ресурса */
  path: string
  /** Ключ опубликованного ресурса */
  public_key: string
  /** Поле, по которому отсортирован список */
  sort?: string
  /** Общее количество элементов в списке */
  total?: string
}

export type PublicSettingsAccesses = {
  /** ID доступа. */
  id?: string
  /** Тип макроса. */
  macros: Array<string>
  /** ID организации. */
  org_id?: string
  /** Список прав адресного доступа. */
  rights: Array<string>
  /** Уровень доступа. */
  type?: string
}

export type SharingRestriction = {
  /** Разрешение предоставлять адресный доступ */
  address_access_sharing: "all" | "deny"
  /** Разрешение предоставлять адресный доступ наружу */
  address_access_sharing_outer: "all" | "employees"
  /** Разрешение предоставлять общий доступ */
  public_sharing: "all" | "deny"
  /** Разрешение предоставлять общий доступ наружу */
  public_sharing_outer: "all" | "employees"
}

export type UpdatePublicSettings = {
  /** Список настроек адресного доступа. */
  accesses?: Array<AddressAccess>
  /** Время жизни ссылки. */
  available_until?: string
  /** Пароль от ссылки. */
  password?: string
}

export type UserPublicInformation = {
  /** Отображаемое имя пользователя. */
  display_name?: string
  /** Логин. */
  login?: string
  /** Идентификатор пользователя. */
  uid?: string
}

export type TrashResource = {
  /** Список вложенных ресурсов */
  _embedded?: TrashResourceList
  /** Статус проверки антивирусом */
  antivirus_status?: unknown
  /** Идентификаторы комментариев */
  comment_ids?: CommentIds
  /** Дата создания */
  created: string
  /** Пользовательские атрибуты ресурса */
  custom_properties?: Record<string, unknown>
  /** Дата добавления в корзину(для ресурсов в корзине) */
  deleted?: string
  /** Метаданные медиафайла (EXIF) */
  exif?: Exif
  /** URL для скачивания файла */
  file?: string
  /** MD5-хэш */
  md5?: string
  /** Определённый Диском тип файла */
  media_type?: string
  /** MIME-тип файла */
  mime_type?: string
  /** Дата изменения */
  modified: string
  /** Имя */
  name: string
  /** Путь откуда был удалён ресурс */
  origin_path?: string
  /** Путь к ресурсу */
  path: string
  /** Дата создания фото или видео файла */
  photoslice_time?: string
  /** URL превью файла */
  preview?: string
  /** Ключ опубликованного ресурса */
  public_key?: string
  /** Публичный URL */
  public_url?: string
  /** Идентификатор ресурса */
  resource_id?: string
  /** Ревизия Диска в которой этот ресурс был изменён последний раз */
  revision?: string
  /** SHA256-хэш */
  sha256?: string
  /** Информация об общей папке */
  share?: ShareInfo
  /** Размер файла */
  size?: string
  /** Все размеры превью с URL для скачивания */
  sizes?: Array<Preview>
  /** Тип */
  type: string
}

export type TrashResourceList = {
  /** Элементы списка */
  items: Array<TrashResource>
  /** Количество элементов на странице */
  limit?: string
  /** Смещение от начала списка */
  offset?: string
  /** Путь к ресурсу, для которого построен список */
  path: string
  /** Поле, по которому отсортирован список */
  sort?: string
  /** Общее количество элементов в списке */
  total?: string
}

export type OperationStatus = {
  /** Статус операции */
  status: string
}

/** What each operation answers, by its id. */
export interface Responses {
  GetDisk: Disk
  GetResource: Resource
  CreateResource: Link
  UpdateResource: Resource
  DeleteResource: Link
  CopyResource: Link
  GetResourceDownloadLink: Link
  GetFlatFilesList: FilesResourceList
  GetLastUploadedFilesList: LastUploadedResourceList
  MoveResource: Link
  ListPublicResources: PublicResourcesList
  PublishResource: Link
  UnpublishResource: Link
  GetResourceUploadLink: ResourceUploadLink
  UploadExternalResource: Link
  GetPublicResource: PublicResource
  GetPublicResourceDownloadLink: Link
  UpdatePublicSettings: unknown
  SaveToDiskPublicResource: Link
  GetTrashResource: TrashResource
  ClearTrash: Link
  RestoreFromTrash: Link
  GetOperationStatus: OperationStatus
}
