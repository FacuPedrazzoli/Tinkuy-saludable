import { gql } from '@apollo/client';

export const PRODUCT_FRAGMENT = gql`
  fragment ProductFields on Product {
    id
    name
    slug
    description
    sku
    isActive
    isVisible
    basePrice
    createdAt
    updatedAt
    variants {
      id
      sku
      name
      price
      isActive
    }
    images {
      id
      url
      altText
      position
    }
    tags {
      tag {
        id
        name
        slug
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($search: String, $tagSlug: String, $isVisible: Boolean, $first: Int, $after: String) {
    products(search: $search, tagSlug: $tagSlug, isVisible: $isVisible, first: $first, after: $after) {
      edges {
        node {
          ...ProductFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      slug
    }
  }
`;

export const CUSTOMER_AUTH_FRAGMENT = gql`
  fragment CustomerAuthFields on CustomerAuthResult {
    token
    customer {
      id
      email
      firstName
      lastName
    }
  }
`;

export const ADMIN_AUTH_FRAGMENT = gql`
  fragment AdminAuthFields on AdminAuthResult {
    token
    user {
      id
      email
      firstName
      lastName
      role
      tenantId
    }
  }
`;

export const CUSTOMER_LOGIN = gql`
  mutation CustomerLogin($input: CustomerLoginInput!) {
    customerLogin(input: $input) {
      ...CustomerAuthFields
    }
  }
  ${CUSTOMER_AUTH_FRAGMENT}
`;

export const CUSTOMER_REGISTER = gql`
  mutation CustomerRegister($input: CustomerRegisterInput!) {
    customerRegister(input: $input) {
      ...CustomerAuthFields
    }
  }
  ${CUSTOMER_AUTH_FRAGMENT}
`;

export const ADMIN_LOGIN = gql`
  mutation AdminLogin($input: AdminLoginInput!) {
    adminLogin(input: $input) {
      ...AdminAuthFields
    }
  }
  ${ADMIN_AUTH_FRAGMENT}
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      role
      tenantId
    }
  }
`;

export const CART_FRAGMENT = gql`
  fragment CartFields on Cart {
    id
    items {
      productId
      variantId
      name
      price
      quantity
      imageUrl
    }
    totalItems
    totalAmount
  }
`;

export const GET_CART = gql`
  query GetCart($cartId: String!) {
    cart(cartId: $cartId) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export const GET_MY_CART = gql`
  query GetMyCart {
    myCart {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export const CREATE_CART = gql`
  mutation CreateCart {
    createCart
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($cartId: String!, $input: UpdateCartItemInput!) {
    updateCartItem(cartId: $cartId, input: $input) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($cartId: String!, $productId: String!, $variantId: String) {
    removeFromCart(cartId: $cartId, productId: $productId, variantId: $variantId) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export const CLEAR_CART = gql`
  mutation ClearCart($cartId: String!) {
    clearCart(cartId: $cartId)
  }
`;

export const CHECKOUT = gql`
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      preferenceId
      initPoint
      sandboxInitPoint
      totalAmount
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders($status: String, $first: Int, $after: String) {
    orders(status: $status, first: $first, after: $after) {
      edges {
        node {
          id
          status
          paymentStatus
          totalAmount
          createdAt
          items {
            id
            name
            price
            quantity
            total
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders($first: Int, $after: String) {
    myOrders(first: $first, after: $after) {
      edges {
        node {
          id
          status
          paymentStatus
          totalAmount
          createdAt
          items {
            id
            name
            price
            quantity
            total
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: String!) {
    order(id: $id) {
      id
      status
      paymentStatus
      totalAmount
      guestEmail
      createdAt
      items {
        id
        name
        price
        quantity
        total
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: String!, $input: UpdateOrderStatusInput!) {
    updateOrderStatus(id: $id, input: $input) {
      id
      status
      paymentStatus
    }
  }
`;

export const GET_ADMIN_METRICS = gql`
  query GetAdminMetrics {
    adminMetrics {
      totalOrders
      pendingOrders
      totalCustomers
      totalProducts
      revenueToday
      revenueThisMonth
      avgOrderValue
    }
  }
`;

export const GET_RECENT_ORDERS = gql`
  query GetRecentOrders($limit: Int) {
    recentOrders(limit: $limit) {
      id
      orderNumber
      customerName
      customerEmail
      total
      status
      paymentStatus
      createdAt
    }
  }
`;

export const GET_TOP_PRODUCTS = gql`
  query GetTopProducts($limit: Int) {
    topProducts(limit: $limit) {
      productName
      quantity
      totalPrice
    }
  }
`;

export const ADMIN_PRODUCT_FRAGMENT = gql`
  fragment AdminProductFields on Product {
    id
    name
    slug
    description
    sku
    isActive
    isVisible
    basePrice
    createdAt
    updatedAt
    variants {
      id
      sku
      name
      price
      isActive
    }
    images {
      id
      url
      altText
      position
    }
    tags {
      tag {
        id
        name
        slug
      }
    }
  }
`;

export const GET_ADMIN_PRODUCTS = gql`
  query GetAdminProducts($search: String, $tagSlug: String, $isVisible: Boolean, $first: Int, $after: String) {
    products(search: $search, tagSlug: $tagSlug, isVisible: $isVisible, first: $first, after: $after) {
      edges {
        node {
          ...AdminProductFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${ADMIN_PRODUCT_FRAGMENT}
`;

export const GET_ADMIN_PRODUCT = gql`
  query GetAdminProduct($id: String!) {
    product(id: $id) {
      ...AdminProductFields
    }
  }
  ${ADMIN_PRODUCT_FRAGMENT}
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      ...AdminProductFields
    }
  }
  ${ADMIN_PRODUCT_FRAGMENT}
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      ...AdminProductFields
    }
  }
  ${ADMIN_PRODUCT_FRAGMENT}
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;

export const GET_TAGS_FOR_ADMIN = gql`
  query GetTagsForAdmin {
    tags {
      id
      name
      slug
    }
  }
`;

export const GET_GUEST_ORDERS = gql`
  query GetGuestOrders($email: String!) {
    guestOrders(email: $email) {
      id
      status
      paymentStatus
      totalAmount
      guestEmail
      createdAt
      items {
        id
        name
        price
        quantity
        total
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      imageUrl
      parentId
      productCount
      sortOrder
      isActive
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
      description
      imageUrl
      parentId
      sortOrder
      isActive
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: String!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      slug
      description
      imageUrl
      parentId
      sortOrder
      isActive
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: String!) {
    deleteCategory(id: $id)
  }
`;

export const REORDER_CATEGORIES = gql`
  mutation ReorderCategories($input: ReorderCategoriesInput!) {
    reorderCategories(input: $input) {
      id
      sortOrder
    }
  }
`;

export const GET_COUPONS = gql`
  query GetCoupons {
    coupons {
      id
      code
      description
      discountType
      discountValue
      minPurchase
      maxUses
      usesCount
      startsAt
      expiresAt
      isActive
      createdAt
    }
  }
`;

export const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) {
      id
      code
      description
      discountType
      discountValue
      minPurchase
      maxUses
      usesCount
      startsAt
      expiresAt
      isActive
    }
  }
`;

export const UPDATE_COUPON = gql`
  mutation UpdateCoupon($id: String!, $input: UpdateCouponInput!) {
    updateCoupon(id: $id, input: $input) {
      id
      code
      description
      discountType
      discountValue
      minPurchase
      maxUses
      usesCount
      startsAt
      expiresAt
      isActive
    }
  }
`;

export const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: String!) {
    deleteCoupon(id: $id)
  }
`;

export const GET_CUSTOMERS = gql`
  query GetCustomers($search: String, $first: Int, $after: String) {
    customers(search: $search, first: $first, after: $after) {
      edges {
        node {
          id
          email
          firstName
          lastName
          phone
          totalOrders
          totalSpent
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const CREATE_IMAGE = gql`
  mutation CreateImage($input: CreateImageInput!) {
    createImage(input: $input) {
      id
      url
      altText
      position
    }
  }
`;

export const DELETE_IMAGE = gql`
  mutation DeleteImage($id: String!) {
    deleteImage(id: $id)
  }
`;

