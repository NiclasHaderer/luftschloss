import { faker } from "@faker-js/faker"
import Fuse from "fuse.js"

const DEFAULT_FACTORY: StringFactory = "random"

// Use the following script to get the methods of faker
// [...document.querySelector(".root").querySelectorAll("li a")].map(element => element.innerText).join("\n")

export const StringFactories = {
  // Address
  buildingNumber: () => faker.address.buildingNumber(),
  cardinalDirection: () => faker.address.cardinalDirection(),
  city: () => faker.address.city(),
  cityName: () => faker.address.cityName(),
  country: () => faker.address.country(),
  countryCode: () => faker.address.countryCode(),
  county: () => faker.address.county(),
  direction: () => faker.address.direction(),
  latitude: () => faker.address.latitude(),
  longitude: () => faker.address.longitude(),
  ordinalDirection: () => faker.address.ordinalDirection(),
  secondaryAddress: () => faker.address.secondaryAddress(),
  state: () => faker.address.state(),
  stateAbbr: () => faker.address.stateAbbr(),
  street: () => faker.address.street(),
  streetAddress: () => faker.address.streetAddress(),
  address: () => faker.address.streetAddress(),
  timeZone: () => faker.address.timeZone(),
  zipCode: () => faker.address.zipCode(),
  // Animal
  bear: () => faker.animal.bear(),
  bird: () => faker.animal.bird(),
  cat: () => faker.animal.cat(),
  cetacean: () => faker.animal.cetacean(),
  cow: () => faker.animal.cow(),
  crocodilia: () => faker.animal.crocodilia(),
  dog: () => faker.animal.dog(),
  fish: () => faker.animal.fish(),
  horse: () => faker.animal.horse(),
  insect: () => faker.animal.insect(),
  lion: () => faker.animal.lion(),
  rabbit: () => faker.animal.rabbit(),
  rodent: () => faker.animal.rodent(),
  snake: () => faker.animal.snake(),
  animalType: () => faker.animal.type(),
  animal: () => {
    const animal = faker.helpers.arrayElement([
      "bear",
      "bird",
      "cat",
      "cetacean",
      "cow",
      "crocodilia",
      "dog",
      "fish",
      "horse",
      "insect",
      "lion",
      "rabbit",
      "rodent",
      "snake",
    ] as const)
    return StringFactories[animal]()
  },
  // Color
  cmyk: () => faker.color.cmyk().join(", "),
  colorByCSSColorSpace: () => faker.color.colorByCSSColorSpace().join(", "),
  cssSupportedFunction: () => faker.color.cssSupportedFunction(),
  cssSupportedSpace: () => faker.color.cssSupportedSpace(),
  color: () => faker.color.human(),
  hsl: () => faker.color.hsl().join(", "),
  hwb: () => faker.color.hwb().join(", "),
  lab: () => faker.color.lab().join(", "),
  lch: () => faker.color.lch().join(", "),
  rgb: () => faker.color.rgb(),
  //Commerce
  department: () => faker.commerce.department(),
  price: () => faker.commerce.price(),
  product: () => faker.commerce.product(),
  productAdjective: () => faker.commerce.productAdjective(),
  productDescription: () => faker.commerce.productDescription(),
  productMaterial: () => faker.commerce.productMaterial(),
  productName: () => faker.commerce.productName(),
  // Company
  companySuffix: () => faker.company.companySuffix(),
  companyName: () => faker.company.name(),
  companySuffixes: () => faker.company.suffixes().join(" "),
  // Date
  birthdate: () => faker.date.birthdate().toISOString(),
  date: () => faker.date.past().toISOString(),
  futureDate: () => faker.date.future().toISOString(),
  pastDate: () => faker.date.past().toISOString(),
  month: () => faker.date.month(),
  day: () => faker.date.weekday(),
  weekday: () => faker.date.weekday(),
  // Finance
  account: () => faker.finance.account(),
  accountName: () => faker.finance.accountName(),
  amount: () => faker.finance.amount(),
  bic: () => faker.finance.bic(),
  bitcoin: () => faker.finance.bitcoinAddress(),
  creditCardCVV: () => faker.finance.creditCardCVV(),
  creditCardIssuer: () => faker.finance.creditCardIssuer(),
  creditCardNumber: () => faker.finance.creditCardNumber(),
  currencyCode: () => faker.finance.currencyCode(),
  currencyName: () => faker.finance.currencyName(),
  currencySymbol: () => faker.finance.currencySymbol(),
  ethereum: () => faker.finance.ethereumAddress(),
  iban: () => faker.finance.iban(),
  litecoin: () => faker.finance.litecoinAddress(),
  mask: () => faker.finance.mask(),
  pin: () => faker.finance.pin(),
  routingNumber: () => faker.finance.routingNumber(),
  transactionDescription: () => faker.finance.transactionDescription(),
  transactionType: () => faker.finance.transactionType(),
  // Image
  imageAbstract: () => faker.image.abstract(),
  imageAnimals: () => faker.image.animals(),
  imageAvatar: () => faker.image.avatar(),
  imageBusiness: () => faker.image.business(),
  imageCats: () => faker.image.cats(),
  imageCity: () => faker.image.city(),
  imageDataUri: () => faker.image.dataUri(),
  imageFashion: () => faker.image.fashion(),
  imageFood: () => faker.image.food(),
  image: () => faker.image.image(),
  imageUrl: () => faker.image.imageUrl(),
  imageNature: () => faker.image.nature(),
  imageNightlife: () => faker.image.nightlife(),
  imagePeople: () => faker.image.people(),
  imageSports: () => faker.image.sports(),
  imageTechnics: () => faker.image.technics(),
  imageTransport: () => faker.image.transport(),
  // Internet
  avatar: () => faker.internet.avatar(),
  domainName: () => faker.internet.domainName(),
  domainSuffix: () => faker.internet.domainSuffix(),
  domainWord: () => faker.internet.domainWord(),
  email: () => faker.internet.email(),
  emoji: () => faker.internet.emoji(),
  exampleEmail: () => faker.internet.exampleEmail(),
  httpMethod: () => faker.internet.httpMethod(),
  httpStatusCode: () => faker.internet.httpStatusCode().toString(),
  ip: () => faker.internet.ip(),
  ipv4: () => faker.internet.ipv4(),
  ipv6: () => faker.internet.ipv6(),
  mac: () => faker.internet.mac(),
  password: () => faker.internet.password(),
  port: () => faker.internet.port().toString(),
  protocol: () => faker.internet.protocol(),
  url: () => faker.internet.url(),
  userAgent: () => faker.internet.userAgent(),
  userName: () => faker.internet.userName(),
  // Lorem
  lines: () => faker.lorem.lines(),
  paragraph: () => faker.lorem.paragraph(),
  paragraphs: () => faker.lorem.paragraphs(),
  sentence: () => faker.lorem.sentence(),
  sentences: () => faker.lorem.sentences(),
  slug: () => faker.lorem.slug(),
  text: () => faker.lorem.text(),
  lorem: () => faker.lorem.word(),
  // Music
  genre: () => faker.music.genre(),
  songName: () => faker.music.songName(),
  //Names
  firstName: () => faker.name.firstName(),
  fullName: () => faker.name.fullName(),
  name: () => faker.name.fullName(),
  gender: () => faker.name.gender(),
  jobArea: () => faker.name.jobArea(),
  jobDescriptor: () => faker.name.jobDescriptor(),
  jobTitle: () => faker.name.jobTitle(),
  jobType: () => faker.name.jobType(),
  lastName: () => faker.name.lastName(),
  middleName: () => faker.name.middleName(),
  prefix: () => faker.name.prefix(),
  suffix: () => faker.name.suffix(),
  // Phone
  imei: () => faker.phone.imei(),
  phoneNumber: () => faker.phone.number(),
  // Random
  alpha: () => faker.random.alpha(),
  alphaNumeric: () => faker.random.alphaNumeric(),
  locale: () => faker.random.locale(),
  numeric: () => faker.random.numeric(),
  word: () => faker.random.word(),
  words: () => faker.random.words(),
  // Science
  elementName: () => faker.science.chemicalElement().name,
  unit: () => faker.science.unit().name,
  unitSymbol: () => faker.science.unit().symbol,
  // System
  fileExt: () => faker.system.commonFileExt(),
  fileName: () => faker.system.commonFileName(),
  fileType: () => faker.system.commonFileType(),
  directoryPath: () => faker.system.directoryPath(),
  filePath: () => faker.system.filePath(),
  mimeType: () => faker.system.mimeType(),
  networkInterface: () => faker.system.networkInterface(),
  semver: () => faker.system.semver(),
  // Vehicle
  bicycle: () => faker.vehicle.bicycle(),
  fuel: () => faker.vehicle.fuel(),
  manufacturer: () => faker.vehicle.manufacturer(),
  model: () => faker.vehicle.model(),
  type: () => faker.vehicle.type(),
  vehicle: () => faker.vehicle.vehicle(),
  vin: () => faker.vehicle.vin(),
  vrm: () => faker.vehicle.vrm(),
  // Words
  adjective: () => faker.word.adjective(),
  adverb: () => faker.word.adverb(),
  conjunction: () => faker.word.conjunction(),
  interjection: () => faker.word.interjection(),
  noun: () => faker.word.noun(),
  preposition: () => faker.word.preposition(),
  verb: () => faker.word.verb(),
  // Random
  random: () => faker.datatype.string(),
}
export type StringFactory = keyof typeof StringFactories

// Exists to quickly check if every factory method returns a string
//const _: () => string = "" as unknown as typeof StringFactories[StringFactory]

const FUSE_SEARCH = new Fuse<StringFactory>(Object.keys(StringFactories) as StringFactory[], {
  includeScore: true,
  shouldSort: true,
  threshold: 0.4,
  isCaseSensitive: false,
})

export const stringFactory = (fieldName?: string): StringFactory => {
  if (fieldName === undefined) return DEFAULT_FACTORY
  const result: Fuse.FuseResult<string>[] = FUSE_SEARCH.search(fieldName)
  if (result.length === 0) return DEFAULT_FACTORY
  return result[0].item as StringFactory
}
