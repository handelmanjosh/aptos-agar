
//only creator of module can initialize coin
module Coin::agar {
    use aptos_framework::managed_coin::{initialize, mint};
    use aptos_framework::coin::{Self, register, transfer};
    use std::signer;

    const MASS_DECIMALS: u64 =  100000;
    const TROPHY_DECIMALS: u64 = 1000;
    const POWER_UP_DECIMALS: u64 =  10; //need to reapply module

    const SIZE_COST: u64 = 45000;
    const SPEED_COST: u64 = 15000;
    const SLOW_COST: u64 = 25000;
    const VIRUS_COST: u64 = 50000;
    const DOUBLE_COST: u64 = 50000;
    const TRIPLE_COST: u64 = 90000;
    const RECOMBINE_COST: u64 = 40000;

    struct MassCoin {}
    struct TrophyCoin {}
    struct SizePowerUp {}
    struct SpeedPowerUp {}
    struct SlowPowerUp {}
    struct PlaceVirusPowerUp {}
    struct DoubleFoodPowerUp {}
    struct TripleFoodPowerUp {}
    struct RecombinePowerUp {}

    fun init_module(admin: &signer) {
        initialize<MassCoin>(admin, b"Agar Mass Coin", b"MASS", 6, false);
        initialize<SizePowerUp>(admin, b"Size Power Up", b"SIZE", 1, false);
        initialize<SpeedPowerUp>(admin, b"Speed Power Up", b"SPEED", 1, false);
        initialize<SlowPowerUp>(admin, b"Slow Power Up", b"SLOW", 1, false);
        initialize<PlaceVirusPowerUp>(admin, b"Place Virus Power Up", b"VIRUS", 1, false);
        initialize<DoubleFoodPowerUp>(admin, b"Double Food Power Up", b"DOUBLE", 1, false);
        initialize<TripleFoodPowerUp>(admin, b"Triple Food Power Up", b"TRIPLE", 1, false);
        initialize<RecombinePowerUp>(admin, b"Recombine Power Up", b"RECOMBINE", 1, false);
        initialize<TrophyCoin>(admin, b"Agar Trophy Coin", b"TROPHY", 4, false);

        register<MassCoin>(admin);
        register<SizePowerUp>(admin);
        register<SpeedPowerUp>(admin);
        register<SlowPowerUp>(admin);
        register<PlaceVirusPowerUp>(admin);
        register<DoubleFoodPowerUp>(admin);
        register<TripleFoodPowerUp>(admin);
        register<RecombinePowerUp>(admin);
        register<TrophyCoin>(admin);
    }
    public entry fun register_user(user: &signer) {
        register<MassCoin>(user);
        register<SizePowerUp>(user);
        register<SpeedPowerUp>(user);
        register<SlowPowerUp>(user);
        register<PlaceVirusPowerUp>(user);
        register<DoubleFoodPowerUp>(user);
        register<TripleFoodPowerUp>(user);
        register<RecombinePowerUp>(user);
        register<TrophyCoin>(user);
    }
    public entry fun buy_size(admin: &signer, buyer: &signer, price: u64) {
        let amount = price / SIZE_COST;
        transfer<MassCoin>(buyer, signer::address_of(admin), price * MASS_DECIMALS);
        mint<SizePowerUp>(admin, signer::address_of(buyer), amount * POWER_UP_DECIMALS);
    }
    public entry fun buy_speed(admin, &signer, buyer: &signer, price: u64) {
        let amount = price  / SPEED_COST;
        transfer<MassCoin>(buyer, signer::address_of(admin), price * MASS_DECIMALS);
        mint<SpeedPowerUp>(admin, signer::address_of(buyer), amount * POWER_UP_DECIMALS);
    }
    public entry fun buy_slow(admin: &signer, buyer: &signer, price: u64) {
        let amount = price / SLOW_COST;
        transfer<MassCoin>(buyer, signer::address_of(admin), price * MASS_DECIMALS);
        mint<SlowPowerUp>(admin, signer::address_of(buyer), amount * POWER_UP_DECIMALS);
    }
    public entry fun buy_virus(admin: &signer, buyer: &signer, price: u64) {
        let amount = price / VIRUS_COST;
        transfer<MassCoin>(buyer, signer::address_of(admin), price * MASS_DECIMALS);
        mint<PlaceVirusPowerUp>(admin, signer::address_of(buyer), amount * POWER_UP_DECIMALS);
    }
    public entry fun buy_double(admin: &signer, buyer: &signer, price: u64) {
        let amount = price / DOUBLE_COST;
        transfer<MassCoin>(buyer, signer::address_of(admin), price * MASS_DECIMALS);
        mint<DoubleFoodPowerUp>(admin, signer::address_of(buyer), amount * POWER_UP_DECIMALS);
    }
    public entry fun buy_triple(admin: &signer, buyer: &signer, price: u64) {
        let amount = price / TRIPLE_COST;
        transfer<MassCoin>(buyer, signer::address_of(admin), price * MASS_DECIMALS);
        mint<TripleFoodPowerUp>(admin, signer::address_of(buyer), amount * POWER_UP_DECIMALS);
    }
    public entry fun buy_recombine(admin: &signer, buyer: &signer, price: u64) {
        let amount = price / RECOMBINE_COST;
        transfer<MassCoin>(buyer, signer::address_of(admin), price * MASS_DECIMALS);
        mint<RecombinePowerUp>(admin, signer::address_of(buyer), amount * POWER_UP_DECIMALS);
    }
    public entry fun mint_mass_to(admin: &signer, dest: address, amount: u64) {
        //mints straight to dest
        mint<MassCoin>(admin, dest, amount * MASS_DECIMALS);
    }
    public entry fun mint_size_to(admin: &signer, dest: address, amount: u64) {
        //mints straight to dest
        mint<SizePowerUp>(admin, dest, amount * POWER_UP_DECIMALS);
    }
    public entry fun mint_speed_to(admin: &signer, dest: address, amount: u64) {
        mint<SpeedPowerUp>(admin, dest, amount * POWER_UP_DECIMALS);
    }
    public entry fun mint_slow_to(admin: &signer, dest: address, amount: u64) {
        mint<SlowPowerUp>(admin, dest, amount * POWER_UP_DECIMALS);
    }
    public entry fun mint_virus_to(admin: &signer, dest: address, amount: u64) {
        mint<PlaceVirusPowerUp>(admin, dest, amount * POWER_UP_DECIMALS);
    }
    public entry fun mint_double_to(admin: &signer, dest: address, amount: u64) {
        mint<DoubleFoodPowerUp>(admin, dest, amount * POWER_UP_DECIMALS);
    }
    public entry fun mint_triple_to(admin: &signer, dest: address, amount: u64) {
        mint<TripleFoodPowerUp>(admin, dest, amount * POWER_UP_DECIMALS);
    }
    public entry fun mint_recombine_to(admin: &signer, dest: address, amount: u64) {
        mint<RecombinePowerUp>(admin, dest, amount * POWER_UP_DECIMALS);
    }
    public entry fun mint_trophy_to(admin: &signer, dest: address, amount: u64) {
        mint<TrophyCoin>(admin, dest, amount * TROPHY_DECIMALS);
    }
    
    public entry fun transfer_mass(from: &signer, to: address, amount: u64) {
        transfer<MassCoin>(from, to, amount * MASS_DECIMALS);
    }
    public entry fun transfer_size(from: &signer, to: address, amount: u64) {
        transfer<SizePowerUp>(from, to, amount * POWER_UP_DECIMALS);
    }
    public entry fun transfer_speed(from: &signer, to: address, amount: u64) {
        transfer<SpeedPowerUp>(from, to, amount * POWER_UP_DECIMALS);
    }
    public entry fun transfer_slow(from: &signer, to: address, amount: u64) {
        transfer<SlowPowerUp>(from, to, amount * POWER_UP_DECIMALS);
    }
    public entry fun transfer_virus(from: &signer, to: address, amount: u64) {
        transfer<PlaceVirusPowerUp>(from, to, amount * POWER_UP_DECIMALS);
    }
    public entry fun transfer_double(from: &signer, to: address, amount: u64) {
        transfer<DoubleFoodPowerUp>(from, to, amount * POWER_UP_DECIMALS);
    }
    public entry fun transfer_triple(from: &signer, to: address, amount: u64) {
        transfer<TripleFoodPowerUp>(from, to, amount * POWER_UP_DECIMALS);
    }
    public entry fun transfer_recombine(from: &signer, to: address, amount: u64) {
        transfer<RecombinePowerUp>(from, to, amount * POWER_UP_DECIMALS);
    }
    public entry fun transfer_trophy(from: &signer, to: address, amount: u64) {
        transfer<TrophyCoin>(from, to, amount * TROPHY_DECIMALS);
    }
    #[view]
    public fun get_mass_balance(owner: address): u64 {
        coin::balance<MassCoin>(owner) / MASS_DECIMALS
    }
    #[view]
    public fun get_size_balance(owner: address): u64 {
        coin::balance<SizePowerUp>(owner) / POWER_UP_DECIMALS
    }
    #[view]
    public fun get_speed_balance(owner: address): u64 {
        coin::balance<SpeedPowerUp>(owner) / POWER_UP_DECIMALS
    }
    #[view]
    public fun get_slow_balance(owner: address): u64 {
        coin::balance<SlowPowerUp>(owner) / POWER_UP_DECIMALS
    }
    #[view]
    public fun get_virus_balance(owner: address): u64 {
        coin::balance<PlaceVirusPowerUp>(owner) / POWER_UP_DECIMALS
    }
    #[view]
    public fun get_double_balance(owner: address): u64 {
        coin::balance<DoubleFoodPowerUp>(owner) / POWER_UP_DECIMALS
    }
    #[view]
    public fun get_triple_balance(owner: address): u64 {
        coin::balance<TripleFoodPowerUp>(owner) / POWER_UP_DECIMALS
    }
    #[view]
    public fun get_recombine_balance(owner: address): u64 {
        coin::balance<RecombinePowerUp>(owner) / POWER_UP_DECIMALS
    }
    #[view]
    public fun get_trophy_balance(owner: address): u64 {
        coin::balance<TrophyCoin>(owner) / TROPHY_DECIMALS
    }    
    
    #[test(source = @0x161610bde96c320c874096f88899d4ec08cc0fd15c46e2f079a0ec5de1a987a2, destination = @0xb0b)]
    public entry fun test_end_to_end(source: signer, destination: signer) {
        let source_addr = signer::address_of(&source);
        let destination_addr = signer::address_of(&destination);
        aptos_framework::account::create_account_for_test(source_addr);
        aptos_framework::account::create_account_for_test(destination_addr);

        initialize<MassCoin>(
            &source,
            b"Agar Mass Coin",
            b"MASS",
            6,
            false,
        );
        initialize<SizePowerUp>(
            &source,
            b"Size Power Up",
            b"SPU",
            1,
            false,
        );
        register<MassCoin>(&source);
        register<SizePowerUp>(&source);

        register_user(&destination);

        assert!(coin::is_coin_initialized<MassCoin>(), 0);
        assert!(coin::is_coin_initialized<SizePowerUp>(), 1);

        send_mass_to(&source, destination_addr, 10);
        send_size_to(&source, destination_addr, 10);


        //assert!(coin::balance<MassCoin>(destination_addr) == 10, 4);
        //assert!(coin::balance<SizePowerUp>(destination_addr) == 10, 6);
    }
}