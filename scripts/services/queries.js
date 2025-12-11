/**
 * GraphQL Queries for BuildRight API Mesh
 * 
 * Centralized query definitions for cleaner organization.
 * All queries target the BuildRight API Mesh endpoints.
 * 
 * @module services/queries
 */

// ============================================
// PERSONA QUERIES
// ============================================

/**
 * Get persona by customer group ID
 * Returns ACO context (catalogViewId, priceBookId)
 */
export const GET_PERSONA = `
  query GetPersona($customerGroupId: String!) {
    BuildRight_personaForCustomer(customerGroupId: $customerGroupId) {
      id
      name
      catalogViewId
      priceBookId
      customerGroupId
    }
  }
`;

/**
 * Get persona by persona ID (e.g., "production-builder")
 */
export const GET_PERSONA_BY_ID = `
  query GetPersonaById($personaId: String!) {
    BuildRight_personaById(personaId: $personaId) {
      id
      name
      catalogViewId
      priceBookId
      customerGroupId
    }
  }
`;

/**
 * Get persona by email (uses Commerce data source when configured)
 * This is the recommended approach for production
 */
export const GET_PERSONA_BY_EMAIL = `
  query GetPersonaByEmail($email: String!) {
    BuildRight_personaByEmail(email: $email) {
      id
      name
      catalogViewId
      priceBookId
      customerGroupId
    }
  }
`;

// ============================================
// PRODUCT SEARCH QUERIES
// ============================================

/**
 * Search products (legacy - backwards compatible)
 */
export const SEARCH_PRODUCTS = `
  query SearchProducts($phrase: String!, $pageSize: Int, $currentPage: Int) {
    BuildRight_searchProducts(phrase: $phrase, pageSize: $pageSize, currentPage: $currentPage) {
      totalCount
      items {
        sku
        name
        description
        imageUrl
        price {
          value
          currency
        }
        inStock
        category
        attributes {
          name
          value
        }
      }
      pageInfo {
        currentPage
        pageSize
        totalPages
      }
    }
  }
`;

/**
 * Consolidated product search with facets
 * Similar to Citisignal_productSearchFilter
 */
export const PRODUCT_SEARCH_FILTER = `
  query ProductSearchFilter(
    $phrase: String
    $filter: BuildRight_ProductFilter
    $sort: BuildRight_SortInput
    $limit: Int = 20
    $page: Int = 1
  ) {
    BuildRight_productSearchFilter(
      phrase: $phrase
      filter: $filter
      sort: $sort
      limit: $limit
      page: $page
    ) {
      products {
        items {
          sku
          name
          description
          imageUrl
          price {
            value
            currency
          }
          inStock
          category
          attributes {
            name
            value
          }
        }
        totalCount
        hasMoreItems
        currentPage
        pageInfo {
          currentPage
          pageSize
          totalPages
        }
      }
      facets {
        facets {
          key
          title
          type
          attributeCode
          options {
            id
            name
            count
          }
        }
        totalCount
      }
      totalCount
    }
  }
`;

/**
 * Search suggestions for autocomplete
 */
export const SEARCH_SUGGESTIONS = `
  query SearchSuggestions($phrase: String!) {
    BuildRight_searchSuggestions(phrase: $phrase) {
      suggestions {
        id
        name
        sku
        urlKey
        price
        image
      }
      totalCount
    }
  }
`;

// ============================================
// PRODUCT DETAIL QUERIES
// ============================================

/**
 * Get product by SKU
 */
export const GET_PRODUCT = `
  query GetProduct($sku: String!) {
    BuildRight_getProductBySKU(sku: $sku) {
      sku
      name
      description
      imageUrl
      price {
        value
        currency
      }
      inStock
      category
      attributes {
        name
        value
      }
    }
  }
`;

// ============================================
// BOM QUERIES
// ============================================

/**
 * Generate BOM from template
 */
export const GENERATE_BOM = `
  query GenerateBOM(
    $templateId: String!
    $variantId: String
    $packageId: String!
    $selectedPhases: [ConstructionPhase!]
  ) {
    BuildRight_generateBOMFromTemplate(
      templateId: $templateId
      variantId: $variantId
      packageId: $packageId
      selectedPhases: $selectedPhases
    ) {
      totalCost {
        value
        currency
      }
      lineItems {
        sku
        name
        quantity
        unit
        unitPrice {
          value
          currency
        }
        totalPrice {
          value
          currency
        }
        category
        phase
        specifications {
          brand
          qualityTier
          constructionPhase
        }
      }
      phases {
        phase
        lineItems {
          sku
          name
          quantity
          unitPrice {
            value
          }
          totalPrice {
            value
          }
        }
        totalCost {
          value
          currency
        }
        percentageOfTotal
      }
      metadata {
        templateId
        packageId
        squareFootage
        generatedAt
        personaId
        variantId
        selectedPhases
        appliedOverrides
      }
    }
  }
`;

// Export all queries as a namespace object for convenience
export default {
  GET_PERSONA,
  GET_PERSONA_BY_ID,
  GET_PERSONA_BY_EMAIL,
  SEARCH_PRODUCTS,
  PRODUCT_SEARCH_FILTER,
  SEARCH_SUGGESTIONS,
  GET_PRODUCT,
  GENERATE_BOM
};

