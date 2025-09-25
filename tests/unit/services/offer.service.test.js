const offerService = require('../../../src/services/offer.service');

describe('Offer Service', () => {
  let initialOffersLength;

  // reset the offers array to ensure isolation
  beforeEach(() => {
    offerService.getAllOffers().length = 0; 
    initialOffersLength = offerService.getAllOffers().length;
  });

  test('should create a new offer', () => {
    const offerData = {
      name: 'Test Offer',
      value_props: ['Prop 1', 'Prop 2'],
      ideal_use_cases: ['Case 1'],
    };

    const newOffer = offerService.createOffer(offerData);

    expect(newOffer).toBeDefined();
    expect(newOffer.id).toBeDefined();
    expect(newOffer.name).toBe('Test Offer');
    expect(offerService.getAllOffers()).toHaveLength(initialOffersLength + 1);
  });

  test('should retrieve all offers', () => {
    const offer1 = offerService.createOffer({ name: 'Offer 1', value_props: [], ideal_use_cases: [] });
    const offer2 = offerService.createOffer({ name: 'Offer 2', value_props: [], ideal_use_cases: [] });

    const allOffers = offerService.getAllOffers();

    expect(allOffers).toHaveLength(initialOffersLength + 2);
    expect(allOffers).toContainEqual(offer1);
    expect(allOffers).toContainEqual(offer2);
  });
});
