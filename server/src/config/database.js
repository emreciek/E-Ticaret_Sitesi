// =============================================================================
// E-TİCARET MARKETPLACE - VERİTABANI YAPILANDIRMASI
// =============================================================================
// Bu dosya Sequelize ORM ve veritabanı bağlantısını yapılandırır.
// Geliştirme için SQLite, üretim için PostgreSQL kullanılır.
// =============================================================================

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// =============================================================================
// VERİTABANI BAĞLANTISI
// =============================================================================
let sequelize;

if (process.env.NODE_ENV === 'production') {
    // ÜRETİM: PostgreSQL kullan
    sequelize = new Sequelize(
        process.env.DB_NAME || 'eticaret_db',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || 'password',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
            logging: false,
            define: { timestamps: true, underscored: true }
        }
    );
} else {
    // GELİŞTİRME: SQLite kullan (kurulum gerektirmez)
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../eticaret.sqlite'),
        logging: console.log,
        define: { timestamps: true, underscored: true }
    });
}

// =============================================================================
// KULLANICI MODELİ (User)
// =============================================================================
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: { msg: 'İsim boş olamaz' } }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: { msg: 'Bu e-posta adresi zaten kullanılıyor' },
        validate: { isEmail: { msg: 'Geçerli bir e-posta adresi girin' } }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(20), // SQLite için STRING
        defaultValue: 'buyer',
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ban_status: {
        type: DataTypes.JSON, // SQLite için JSON
        defaultValue: { offense_count: 0, banned_until: null, permanent: false }
    }
}, {
    tableName: 'users',
    defaultScope: { attributes: { exclude: ['password_hash'] } },
    scopes: { withPassword: { attributes: { include: ['password_hash'] } } }
});

// =============================================================================
// ÜRÜN MODELİ (Product)
// =============================================================================
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    seller_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: { msg: 'Ürün başlığı boş olamaz' } }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    images: {
        type: DataTypes.JSON, // SQLite için JSON
        allowNull: false,
        defaultValue: []
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    return_policy: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    boost_tier: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'products'
});

// =============================================================================
// MESAJ MODELİ (Message)
// =============================================================================
const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    conversation_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    sender_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    receiver_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_flagged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'messages'
});

// =============================================================================
// MODERASYON LOGU MODELİ (ModerationLog)
// =============================================================================
const ModerationLog = sequelize.define('ModerationLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    message_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    offense_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    detected_content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    action_taken: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    banned_until: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'moderation_logs'
});

// =============================================================================
// İŞLEM/SİPARİŞ MODELİ (Transaction)
// =============================================================================
const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    buyer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    seller_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    commission: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20), // SQLite için STRING
        defaultValue: 'pending'
    }
}, {
    tableName: 'transactions'
});

// =============================================================================
// BOOST ABONELİĞİ MODELİ (BoostSubscription)
// =============================================================================
// Satıcıların görünürlük artırma aboneliklerini takip eder
const BoostSubscription = sequelize.define('BoostSubscription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    seller_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    tier: {
        type: DataTypes.INTEGER, // 1: Bronze, 2: Silver, 3: Gold
        allowNull: false,
        validate: { min: 1, max: 3 }
    },
    starts_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    amount_paid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20), // active, expired, cancelled
        defaultValue: 'active'
    }
}, {
    tableName: 'boost_subscriptions'
});

// =============================================================================
// MODEL İLİŞKİLERİ
// =============================================================================
User.hasMany(Product, { foreignKey: 'seller_id', as: 'products' });
Product.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

User.hasMany(ModerationLog, { foreignKey: 'user_id', as: 'moderationLogs' });
ModerationLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'buyer_id', as: 'purchases' });
User.hasMany(Transaction, { foreignKey: 'seller_id', as: 'sales' });
Product.hasMany(Transaction, { foreignKey: 'product_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
Transaction.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });
Transaction.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(BoostSubscription, { foreignKey: 'seller_id', as: 'boostSubscriptions' });
BoostSubscription.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

// =============================================================================
// DIŞA AKTARMA
// =============================================================================
module.exports = {
    sequelize,
    User,
    Product,
    Message,
    ModerationLog,
    Transaction,
    BoostSubscription
};
