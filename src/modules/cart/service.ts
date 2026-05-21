import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface AddToCartInput {
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface UpdateQuantityInput {
  cartItemId: string;
  quantity: number;
}

export interface RemoveFromCartInput {
  cartItemId: string;
}

export interface CartResult {
  id: string;
  items: CartItemResult[];
  totalItems: number;
  totalAmount: string;
}

export interface CartItemResult {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  price: string;
  quantity: number;
  imageUrl: string | null;
  total: string;
}

export async function getCart(userId?: string, sessionId?: string) {
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              variants: { where: { isActive: true } },
            },
          },
          variant: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (!cart) return null;

  return formatCart(cart);
}

export async function addToCart(
  userId: string | null,
  sessionId: string | null,
  input: AddToCartInput
): Promise<CartResult> {
  const { productId, quantity, variantId } = input;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      variants: variantId ? { where: { id: variantId } } : undefined,
    },
  });

  if (!product || !product.isActive) {
    throw new Error('Product not found or unavailable');
  }

  const stock = variantId 
    ? product.variants?.[0]?.stock ?? 0 
    : product.stock;

  if (stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${stock}`);
  }

  let cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: userId || null,
        sessionId: userId ? null : sessionId || uuidv4(),
      },
    });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > stock) {
      throw new Error(`Cannot add more. Would exceed available stock (${stock})`);
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
      },
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              variants: { where: { isActive: true } },
            },
          },
          variant: true,
        },
      },
    },
  });

  return formatCart(updatedCart!);
}

export async function removeFromCart(
  userId: string | null,
  sessionId: string | null,
  input: RemoveFromCartInput
): Promise<CartResult> {
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  const item = await prisma.cartItem.findFirst({
    where: {
      id: input.cartItemId,
      cartId: cart.id,
    },
  });

  if (!item) {
    throw new Error('Cart item not found');
  }

  await prisma.cartItem.delete({
    where: { id: item.id },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              variants: { where: { isActive: true } },
            },
          },
          variant: true,
        },
      },
    },
  });

  return formatCart(updatedCart!);
}

export async function updateCartItemQuantity(
  userId: string | null,
  sessionId: string | null,
  input: UpdateQuantityInput
): Promise<CartResult> {
  const { cartItemId, quantity } = input;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  const item = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cartId: cart.id,
    },
    include: {
      product: true,
      variant: true,
    },
  });

  if (!item) {
    throw new Error('Cart item not found');
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: item.id },
    });
  } else {
    const stock = item.variant?.stock ?? item.product.stock;
    if (quantity > stock) {
      throw new Error(`Insufficient stock. Available: ${stock}`);
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              variants: { where: { isActive: true } },
            },
          },
          variant: true,
        },
      },
    },
  });

  return formatCart(updatedCart!);
}

export async function mergeGuestCart(
  userId: string,
  guestSessionId: string
): Promise<CartResult> {
  const guestCart = await prisma.cart.findFirst({
    where: { sessionId: guestSessionId },
    include: { items: true },
  });

  const userCart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              variants: { where: { isActive: true } },
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!guestCart || guestCart.items.length === 0) {
    if (userCart) {
      return formatCart(userCart);
    }
    return createEmptyCart();
  }

  let targetCart = userCart;

  if (!targetCart) {
    targetCart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                variants: { where: { isActive: true } },
              },
            },
            variant: true,
          },
        },
      },
    });
  }

  for (const guestItem of guestCart.items) {
    const existingItem = targetCart!.items.find(
      (item) =>
        item.productId === guestItem.productId &&
        item.variantId === guestItem.variantId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + guestItem.quantity;
      const stock = existingItem.variant?.stock ?? existingItem.product.stock;
      
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: Math.min(newQuantity, stock) },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: targetCart!.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          quantity: guestItem.quantity,
        },
      });
    }
  }

  await prisma.cart.delete({
    where: { id: guestCart.id },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: targetCart.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              variants: { where: { isActive: true } },
            },
          },
          variant: true,
        },
      },
    },
  });

  return formatCart(updatedCart!);
}

export async function clearCart(userId?: string, sessionId?: string): Promise<void> {
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}

function formatCart(cart: {
  id: string;
  items: Array<{
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    product: {
      name: string;
      basePrice: bigint | number;
      images: Array<{ url: string }>;
      variants: Array<{ price: bigint | number }>;
    };
    variant: { name: string; price: bigint | number } | null;
  }>;
}): CartResult {
  const items: CartItemResult[] = cart.items.map((item) => {
    const price = item.variant?.price ?? item.product.basePrice;
    const total = Number(price) * item.quantity;

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.variant ? `${item.product.name} - ${item.variant.name}` : item.product.name,
      price: price.toString(),
      quantity: item.quantity,
      imageUrl: item.product.images[0]?.url ?? null,
      total: total.toFixed(2),
    };
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2);

  return {
    id: cart.id,
    items,
    totalItems,
    totalAmount,
  };
}

function createEmptyCart(): CartResult {
  return {
    id: uuidv4(),
    items: [],
    totalItems: 0,
    totalAmount: '0.00',
  };
}
