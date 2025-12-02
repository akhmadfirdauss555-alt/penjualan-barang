<!DOCTYPE html>
<html>
<head>
    <title>Order Produk</title>
</head>
<body>

<h2>Form Order Produk</h2>

<form action="order.php" method="POST">
    <input type="hidden" name="product_id" value="1">

    Nama Lengkap:<br>
    <input type="text" name="customer_name" required><br><br>

    Nomor WhatsApp:<br>
    <input type="text" name="phone" required><br><br>

    Alamat Lengkap:<br>
    <textarea name="address" required></textarea><br><br>

    Jumlah (Qty):<br>
    <input type="number" name="quantity" value="1" required><br><br>

    <button type="submit">Order via WhatsApp</button>
</form>

</body>
</html>
