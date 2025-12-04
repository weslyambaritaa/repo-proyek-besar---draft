<?php

namespace Tests\Unit\Helper;

use App\Helper\ConstHelper;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ConstHelperTest extends TestCase
{
    #[Test]
    public function get_option_roles_returns_sorted_roles()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        // PERBAIKAN: Menambahkan 'Banner' dan memastikan urutan Abjad
        $expectedRoles = [
            'Admin', 
            'Banner', 
            'Campus Hiring', 
            'Lowongan Pekerjaan', 
            'Perusahaan', 
            'Todo'
        ];

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ConstHelper::getOptionRoles();

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($expectedRoles, $result);
        $this->assertIsArray($result);
        $this->assertContainsOnly('string', $result);
    }

    #[Test]
    public function option_roles_constant_contains_correct_values()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        // Menambahkan 'Banner' ke dalam daftar ekspektasi
        $expectedRoles = ['Admin', 'Todo', 'Perusahaan', 'Campus Hiring', 'Lowongan Pekerjaan', 'Banner'];
        
        // Update jumlah ekspektasi dari 5 menjadi 6
        $expectedCount = 6;

        // =====================================
        // Act (Aksi)
        // =====================================
        $constantValue = ConstHelper::OPTION_ROLES;

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        // Sorting kedua array agar perbandingan isi datanya valid tanpa peduli urutan indeks
        sort($expectedRoles);
        sort($constantValue);

        $this->assertEquals($expectedRoles, $constantValue);
        $this->assertCount($expectedCount, $constantValue);
    }

    #[Test]
    public function get_option_roles_always_returns_consistent_result()
    {
        $firstCall = ConstHelper::getOptionRoles();
        $secondCall = ConstHelper::getOptionRoles();

        $this->assertEquals($firstCall, $secondCall);
    }
}