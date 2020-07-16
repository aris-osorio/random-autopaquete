const functions = require('firebase-functions');
const { soap } = require('strong-soap');
const secure = require('./secure');
const { getGuiaById, saveLabel, saveError, checkBalance } = require('./guia');

exports.create = functions.https.onRequest(async (req, res) => {
    const contentType = req.get('content-type');
    if (!contentType && contentType !== 'application/json') {
        res.status(400).send('Bad Request: Expected JSON');
        return;
    }

    const profile = await secure.user(req);
    if (!profile) {
        res.status(403).send('Not authorized');
        return;
    }

    const { guiaId } = JSON.parse(req.body);
    const guia = await getGuiaById(profile.ID, guiaId);
    if (!profile) {
        res.status(400).send('Guia Id not found');
        return;
    }
    if (guia.status !== 'completed') {
        res.status(400).send('Guia not completed');
        return;
    }
    if (!checkBalance(guiaId, false)) {
        res.status(400).send('Not enough balance');
        return;
    }

    const senderAddress = guia.sender_addresses;
    const receiverAddress = guia.receiver_addresses;
    const packaging = guia.package;

    const quantity = parseInt(packaging.quantity, 10);

    if (Number.isNaN(quantity) || quantity === 0) {
        res.status(400).send('Quantity not a number larger than 0');
        return;
    }

    const packageLineItems = [];
    for (let i = 1; i <= quantity; i += 1) {
        packageLineItems.push({
            SequenceNumber: `${i}`,
            Weight: {
                Units: 'KG',
                Value: packaging.weight,
            },
            Dimensions: {
                Length: packaging.depth,
                Width: packaging.width,
                Height: packaging.height,
                Units: 'CM',
            },
        });
    }

    const url = './ShipService_v25.wsdl';

    const requestArgs = {
        ProcessShipmentRequest: {
            WebAuthenticationDetail: {
                UserCredential: {
                    Key: '4otzuKjLzVkx5qdQ',
                    Password: 'AyaldeyfISXNQW9YZ7ctDk2jA',
                },
            },
            ClientDetail: {
                AccountNumber: '510087780',
                MeterNumber: '119126102',
            },
            Version: {
                ServiceId: 'ship',
                Major: '25',
                Intermediate: '0',
                Minor: '0',
            },
            RequestedShipment: {
                ShipTimestamp: new Date().toISOString(),
                DropoffType: 'BUSINESS_SERVICE_CENTER',
                ServiceType: 'FEDEX_EXPRESS_SAVER',
                PackagingType: 'YOUR_PACKAGING',
                PreferredCurrency: 'NMP',
                Shipper: {
                    Contact: {
                        PersonName: senderAddress.name,
                        PhoneNumber: senderAddress.phone,
                    },
                    Address: {
                        StreetLines: senderAddress.street_number,
                        City: senderAddress.country,
                        StateOrProvinceCode: senderAddress.state,
                        PostalCode: senderAddress.codigo_postal,
                        CountryCode: 'MX',
                    },
                },
                Recipient: {
                    Contact: {
                        PersonName: receiverAddress.name,
                        PhoneNumber: receiverAddress.phone,
                    },
                    Address: {
                        StreetLines: receiverAddress.street_number,
                        City: receiverAddress.country,
                        StateOrProvinceCode: receiverAddress.state,
                        PostalCode: receiverAddress.codigo_postal,
                        CountryCode: 'MX',
                    },
                },
                ShippingChargesPayment: {
                    PaymentType: 'SENDER',
                    Payor: {
                        ResponsibleParty: {
                            AccountNumber: '510087780',
                            Contact: {
                                ContactId: '12345',
                                PersonName: senderAddress.name,
                            },
                        },
                    },
                },
                LabelSpecification: {
                    LabelFormatType: 'COMMON2D',
                    ImageType: 'PDF',
                    LabelStockType: 'PAPER_7X4.75',
                },
                RateRequestTypes: 'LIST',
                PackageCount: packaging.quantity,
                RequestedPackageLineItems: packageLineItems,
            },
        },
    };

    soap.createClient(url, {}, function(err, client) {
        client.ShipService.ShipServicePort.processShipment(requestArgs, function(err1, result) {
            const apiResult = JSON.parse(JSON.stringify(result));
            if (err1 || !result) {
                saveError(guiaId, result, err1);
                res.status(200).send('NOT OK');
                return;
            }
            const packageDetail = apiResult.CompletedShipmentDetail.CompletedPackageDetails[0];
            const pdf = packageDetail.Label.Parts[0].Image;
            const guias = [];
            for (let i = 0; i < packageDetail.TrackingIds.length; i += 1) {
                guias.push(packageDetail.TrackingIds[i].TrackingNumber);
            }
            saveLabel(guiaId, pdf, guias, apiResult);
            res.status(200).send('OK');
        });
    });
});