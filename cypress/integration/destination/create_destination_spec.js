describe('Create Destination', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/destinations/new');
  });

  it('renders the page and takes a screenshot', () => {
    cy.getByTestId('CreateSourceDialog').should('contain', 'Email');
    cy.getByTestId('SearchSource').click();
    cy.percySnapshot('Create Destination - Types');
  });
});
