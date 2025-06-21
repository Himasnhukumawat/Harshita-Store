"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ProductList } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { List, Search, Download, Filter, Package, CheckCircle, XCircle, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ProductListsPage() {
  const [products, setProducts] = useState<ProductList[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, categoryFilter, statusFilter, availabilityFilter])

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "product_lists"))
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isAvailable: doc.data().isAvailable ?? true,
      })) as ProductList[]

      // Sort by category, then by name for better shop organization
      const sortedProducts = productsData.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category)
        }
        return a.name.localeCompare(b.name)
      })

      setProducts(sortedProducts)

      // Extract unique categories
      const uniqueCategories = [...new Set(productsData.map((product) => product.category))].filter(Boolean)
      setCategories(uniqueCategories.sort())
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to fetch product lists")
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.subCategory && product.subCategory.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => {
        if (statusFilter === "active") return product.isActive
        if (statusFilter === "inactive") return !product.isActive
        return true
      })
    }

    // Availability filter
    if (availabilityFilter !== "all") {
      filtered = filtered.filter((product) => {
        if (availabilityFilter === "available") return product.isAvailable
        if (availabilityFilter === "unavailable") return !product.isAvailable
        return true
      })
    }

    setFilteredProducts(filtered)
  }

  const generateShopPDF = async (productsToExport: ProductList[], title: string) => {
    try {
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height

      // Store Header - Compact and Professional
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("🏪 HARSHITA GENERAL STORE", pageWidth / 2, 20, { align: "center" })

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text("Complete Product Catalog & Price List", pageWidth / 2, 28, { align: "center" })

      // Group products by category
      const productsByCategory = productsToExport.reduce(
        (acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = []
          }
          acc[product.category].push(product)
          return acc
        },
        {} as Record<string, ProductList[]>,
      )

      let currentY = 40
      let serialNumber = 1

      // Generate compact table for each category
      Object.entries(productsByCategory).forEach(([category, categoryProducts]) => {
        // Check if we need a new page (reserve space for category header + at least 3 rows)
        if (currentY > pageHeight - 60) {
          doc.addPage()
          currentY = 20
        }

        // Category Header - Compact with light background
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")

        // Light blue background for category
        doc.setFillColor(240, 248, 255)
        doc.rect(15, currentY - 2, pageWidth - 30, 10, "F")

        // Category border
        doc.setDrawColor(200, 220, 240)
        doc.setLineWidth(0.3)
        doc.rect(15, currentY - 2, pageWidth - 30, 10)

        // Category text
        doc.setTextColor(30, 64, 175)
        doc.text(`📁 ${category.toUpperCase()}`, 18, currentY + 5)
        doc.setTextColor(0, 0, 0)

        currentY += 15

        // Prepare compact table data
        const tableData = categoryProducts.map((product) => [
          serialNumber.toString(),
          product.name,
          product.subCategory || "—",
          `₹${product.mrp.toLocaleString("en-IN")}`,
        ])

        serialNumber += categoryProducts.length

        // Compact table with minimal styling
        autoTable(doc, {
          head: [["S.No.", "Product Name", "Sub-Category", "Price (₹)"]],
          body: tableData,
          startY: currentY,
          styles: {
            fontSize: 9,
            cellPadding: 2,
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
            textColor: [40, 40, 40],
            font: "helvetica",
          },
          headStyles: {
            fillColor: [248, 250, 252],
            textColor: [55, 65, 81],
            fontStyle: "bold",
            fontSize: 10,
            cellPadding: 3,
          },
          columnStyles: {
            0: { halign: "center", cellWidth: 18 }, // S.No
            1: { halign: "left", cellWidth: 95 }, // Product Name
            2: { halign: "left", cellWidth: 35 }, // Sub-Category
            3: { halign: "right", cellWidth: 32, fontStyle: "bold" }, // Price
          },
          margin: { left: 15, right: 15 },
          tableWidth: "auto",
          didDrawPage: (data) => {
            currentY = data.cursor?.y || currentY
          },
          theme: "grid",
          tableLineColor: [220, 220, 220],
          tableLineWidth: 0.2,
        })

        currentY += 8 // Small gap between categories
      })

      // Add page numbers to all pages
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(120, 120, 120)
        doc.text(`${i}`, pageWidth / 2, pageHeight - 10, { align: "center" })
      }

      // Generate clean filename
      const date = new Date().toISOString().split("T")[0]
      const filename = `Harshita-Store-Catalog-${date}.pdf`

      doc.save(filename)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setError("Failed to generate PDF. Please try again.")
    }
  }

  const handleExportAll = () => {
    generateShopPDF(filteredProducts, "Complete Product List")
  }

  const handleExportAvailable = () => {
    const availableProducts = filteredProducts.filter((product) => product.isAvailable)
    generateShopPDF(availableProducts, "Available Products")
  }

  const handleExportByCategory = () => {
    if (categoryFilter !== "all") {
      const categoryProducts = filteredProducts.filter((product) => product.category === categoryFilter)
      generateShopPDF(categoryProducts, `${categoryFilter} Products`)
    }
  }

  // Alternative CSV export function as fallback
  const exportToCSV = (productsToExport: ProductList[], filename: string) => {
    const headers = ["#", "Product Name", "Category", "Sub-Category", "MRP", "Status", "Availability", "Added Date"]

    const csvData = productsToExport.map((product, index) => [
      index + 1,
      `"${product.name}"`,
      `"${product.category}"`,
      `"${product.subCategory || "-"}"`,
      product.mrp,
      product.isActive ? "Active" : "Inactive",
      product.isAvailable ? "Available" : "Unavailable",
      product.createdAt ? new Date(product.createdAt.toDate()).toLocaleDateString() : "No date",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename.replace(".pdf", ".csv"))
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleExportCSV = (type: string) => {
    const date = new Date().toISOString().split("T")[0]

    switch (type) {
      case "all":
        exportToCSV(filteredProducts, `product-list-all-${date}.csv`)
        break
      case "active":
        exportToCSV(
          filteredProducts.filter((p) => p.isActive),
          `product-list-active-${date}.csv`,
        )
        break
      case "available":
        exportToCSV(
          filteredProducts.filter((p) => p.isAvailable),
          `product-list-available-${date}.csv`,
        )
        break
      case "unavailable":
        exportToCSV(
          filteredProducts.filter((p) => !p.isAvailable),
          `product-list-unavailable-${date}.csv`,
        )
        break
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading product lists..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Lists</h1>
          <p className="text-muted-foreground">Generate professional product lists for your shop</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Export
          </CardTitle>
          <CardDescription>Filter products and generate professional PDF price lists</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Available Only</SelectItem>
                <SelectItem value="unavailable">Unavailable Only</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="outline" className="flex items-center justify-center">
              {filteredProducts.length} products
            </Badge>
          </div>

          {/* Export Buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <h4 className="text-sm font-medium">Generate Shop Price Lists (PDF):</h4>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleExportAll}
                disabled={filteredProducts.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Complete Price List ({filteredProducts.length} items)
              </Button>

              <Button
                variant="outline"
                onClick={handleExportAvailable}
                disabled={filteredProducts.filter((p) => p.isAvailable).length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Available Items Only ({filteredProducts.filter((p) => p.isAvailable).length})
              </Button>

              {categoryFilter !== "all" && (
                <Button variant="outline" onClick={handleExportByCategory} disabled={filteredProducts.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  {categoryFilter} Category ({filteredProducts.length})
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
              <p className="font-medium mb-1">📋 Professional Shop Format:</p>
              <ul className="space-y-1">
                <li>• Products organized by category for easy browsing</li>
                <li>• Clean table format with serial numbers and prices</li>
                <li>• Store header with generation date and summary</li>
                <li>• Perfect for customer reference and staff use</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{filteredProducts.length}</div>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ₹{filteredProducts.reduce((sum, product) => sum + product.mrp, 0).toLocaleString("en-IN")}
              </div>
              <p className="text-sm text-muted-foreground">Total Catalog Value</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {filteredProducts.filter((p) => p.isActive).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Products</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {filteredProducts.filter((p) => p.isAvailable).length}
              </div>
              <p className="text-sm text-muted-foreground">Available for Sale</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product List Preview */}
      {filteredProducts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Product Preview ({filteredProducts.length} items)
            </CardTitle>
            <CardDescription>This is how your products will appear in the generated PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 text-left p-3 font-medium">S.No</th>
                    <th className="border border-gray-200 text-left p-3 font-medium">Product Name</th>
                    <th className="border border-gray-200 text-left p-3 font-medium">Category</th>
                    <th className="border border-gray-200 text-left p-3 font-medium">Sub-Category</th>
                    <th className="border border-gray-200 text-right p-3 font-medium">MRP (₹)</th>
                    <th className="border border-gray-200 text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.slice(0, 10).map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-3 text-center text-sm">{index + 1}</td>
                      <td className="border border-gray-200 p-3 font-medium">{product.name}</td>
                      <td className="border border-gray-200 p-3">{product.category}</td>
                      <td className="border border-gray-200 p-3">{product.subCategory || "-"}</td>
                      <td className="border border-gray-200 p-3 text-right font-semibold text-green-600">
                        ₹{product.mrp.toLocaleString("en-IN")}
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        {product.isAvailable ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                            <XCircle className="w-3 h-3 mr-1" />
                            Unavailable
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length > 10 && (
                <div className="text-center py-4 text-sm text-muted-foreground bg-gray-50 border border-t-0 border-gray-200">
                  ... and {filteredProducts.length - 10} more products
                  <br />
                  <span className="text-xs">Generate PDF to see complete list</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all" || availabilityFilter !== "all"
                ? "No products found"
                : "No products yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all" || availabilityFilter !== "all"
                ? "Try adjusting your filters"
                : "Products will appear here when you add them"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
