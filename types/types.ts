// types.ts

export interface Photo {
  _id: string;
  url: string;
  key: string;       // e.g. "productphotos/filename.jpg"
  name?: string;     // optional descriptive name or alt text
  uploadedAt?: Date; // timestamp
}


interface PopulatedUser {
  _id: string;
  name?: string;
  profilePictureUrl?: string;
  // add any other user fields you might populate
}
export interface Message {
    _id: string;
    senderId: string;
    recipientId: string;
    content: string;
    createdAt: string; // or Date if using Date objects
    // Add other fields if necessary
  }
  
  export interface NewMessage {
    senderId: string;
    recipientId: string;
    content: string;
  }
  
export interface Conversation {
    otherUserId: string;
    otherUserName: string;
    lastMessageContent: string;
    lastMessageDate: string; // or Date
  }
  
  export interface Material {
    [key: string]: string | boolean | number;
    name: string;
    percentageRenewable: number;
  }
  export interface UploadedDocument {
    _id: string;
    url: string;
    name: string;
    verified: boolean;
    uploadedAt?: Date;
    category: string;
    rejectionReason?: string;
  }

  export interface Review {
    _id?: string;
    userId: string; // ID of the reviewer
    rating: number; // Rating between 1 and 5
    comment: string; // Review text
    createdAt: Date; // Timestamp of the review
  }

  interface PeerRatings {
    costEffectiveness: {
      userId: string;
      rating: number;
    }[];
    economicViability: {
      userId: string;
      rating: number;
    }[];
  }


  
  export interface Product {
    _id: string;
  
    /**
     * The user's ID who created/owns this product.
     * Could also be stored as a string if we just store the ObjectId,
     * or as a full object if we populate user data on the frontend.
     */
    userId: string | PopulatedUser;
    photos: Photo[];
    name: string;
    description: string;
    price: number;
    categories: string[];
  
    /*
    materials: {
      name: string;
      percentageRenewable: number;
    }[];
    energyUsage?: {
      value?: number;
      unit?: string;
    };
    waterUsage?: {
      value?: number;
      unit?: string;
    };
    recyclable: boolean;
    productionCost?: number;
    lifecycleCost?: number;
    carbonEmissions?: number;
    costEffectiveness?: number;   // 0–10
    ethicalPractices?: string[];  // array of strings
    */
    // [NEW - optional, matching the Mongoose schema]
    chosenMetrics: string[];
    // For the front end, we often store the map as an object:
    metrics: Record<string, any>;
  
    uploadedDocuments: UploadedDocument[];
    // Verified flags
    isVerified: boolean;
    verificationPending: boolean;
  
    // Optionally timestamps
    createdAt?: string;
    updatedAt?: string;
    reviews?: Review[];
    peerRatings: PeerRatings;
  }
  
  

  
  export interface Service {
    _id: string;
    photos: Photo[];
    userId: string | PopulatedUser; // or { _id: string; name?: string; companyName?: string; }
    name: string;
    description: string;
    categories: string[];
    price: number;
  
    /* old ers metrics
    materials?: {
      name: string;
      percentageRenewable: number;
    }[];
    energyUsage?: {
      value?: number;
      unit?: string;
    };
    waterUsage?: {
      value?: number;
      unit?: string;
    };
    recyclable: boolean;
    serviceCost?: number;
    carbonEmissions?: number;
    costEffectiveness?: number;
    ethicalPractices?: string[];
    */

    chosenMetrics: string[];
    metrics: Record<string, any>;
  
    // Documents
    uploadedDocuments: {
      _id: string;
      url: string;
      name: string;
      verified: boolean;
      uploadedAt?: Date;
      rejectionReason?: string;
      category: string;
  
    }[];
  
    // Verification
    isVerified: boolean;
    verificationPending: boolean;
  
    // Optionally timestamps
    createdAt?: string;
    updatedAt?: string;

    peerRatings: PeerRatings;
  
    // If you store or populate reviews for services:
    reviews?:Review[];
  }
  
  
  
  


  export interface ProductFormData {
    userId: string;
    name: string;
    description: string;
    price: number;
    // If you're collecting categories in a single text field (comma-separated),
    // keep it as a string. Otherwise use string[] if you store multiple categories directly.
    categories: string[];
  
   /* old ers metrics
    materials: Material[];
    energyUsage: {
      value: string; // user-typed string, can parse to number if needed
      unit: string;
    };
    waterUsage: {
      value: string;
      unit: string;
    };
    recyclable: boolean;
    productionCost: string;
    lifecycleCost: string;
    carbonEmissions: string;
    costEffectiveness: string;
    ethicalPractices: string[];
    */
    chosenMetrics: string[];          // e.g. ["energyUsage", "carbonEmissions", "recyclable"]
    metrics: Record<string, any>;     // e.g. { "energyUsage": 200, "carbonEmissions": "N/A", "recyclable": true }

  }
    


  export interface ServiceFormData {
    userId: string;
    name: string;
    description: string;
    price: number;
    categories: string[];
  
    /*
    materials: Material[];
    energyUsage: {
      value: string; 
      unit: string;
    };
    waterUsage: {
      value: string;
      unit: string;
    };
    recyclable: boolean;
    serviceCost: number;
    carbonEmissions: string;
    costEffectiveness: string;
    ethicalPractices: string[];
    */

    chosenMetrics: string[];          // e.g. ["energyUsage", "carbonEmissions", "recyclable"]
    metrics: Record<string, any>;     // e.g. { "energyUsage": 200, "carbonEmissions": "N/A", "recyclable": true }
  
    photos: Photo[];
    uploadedDocuments: UploadedDocument[];
  }
  

  export interface UserType {
    _id: string;
    name?: string;
    bio?: string;
    email: string;
    password: string;
    profilePictureUrl?: string;
    emailVerified?: Date;
    subscriptionStatus: 'free' | 'subscribed' | 'premium';
    role: string;
    interests: string[];
    location?: string;
    subscribeNewsletter: boolean;
    companyName?: string;
    website?: string;
    preferences?: Record<string, any>;
    uploadedDocuments: UploadedDocument[];
    isVerified: boolean;
    verificationPending: boolean;
  
    // references to products, services, posts, etc.
    product: string[];   // array of Product IDs
    service: string[];   // array of Service IDs
    Post: string[];      // array of Post IDs
  
    createdAt?: Date;
    updatedAt?: Date;
  
    /**
     * Dynamic metrics approach
     */
    chosenMetrics: string[];
    metrics: Record<string, any>;
  
    /**
     * If you plan to remove or replace the old ersMetrics subobject, comment it out:
     */
    // ersMetrics?: {
    //   economicImpactRating: number;
    //   additionalEthicalPractices: string[];
    //   carbonFootprint: number;
    //   carbonOffsets: number;
    //   hasSustainabilityPolicy: boolean;
    //   charitableDonationsPercent: number;
    //   hasVolunteerPrograms: boolean;
    //   overallScore: number;
    // };
  }